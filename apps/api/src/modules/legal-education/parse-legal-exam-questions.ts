import mammoth from "mammoth";

export interface ParsedLegalExamQuestion {
  number: number;
  text: string;
  options: string[];
  correctOptionIndex: number;
}

export interface LegalExamQuestionParseError {
  questionNumber: number | null;
  message: string;
}

export interface ParseLegalExamQuestionsResult {
  questions: ParsedLegalExamQuestion[];
  errors: LegalExamQuestionParseError[];
}

const QUESTION_START = /^(?:câu(?:\s+hỏi)?)\s*(\d+)\s*[:.)]*/i;
const ANSWER_LINE = /^đáp\s+án(?:\s+đúng|\s+chuẩn)?\s*[:.]?\s*([A-Da-d])\b/i;

function normalizeLines(raw: string): string[] {
  return raw
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .split("\n")
    .map((line) => line.replace(/\t/g, " ").trim())
    .filter(Boolean);
}

function letterIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

function isParseError(
  value: ParsedLegalExamQuestion | LegalExamQuestionParseError
): value is LegalExamQuestionParseError {
  return "message" in value;
}

/** Mốc A./B./C./D. ở đầu chuỗi, sau khoảng trắng, hoặc dính chữ thường (...lênB. Phải...). */
function isOptionMarker(body: string, index: number): boolean {
  if (index === 0) return true;
  const prev = body[index - 1] ?? "";
  return /\s/.test(prev) || /\p{Ll}/u.test(prev);
}

function splitLabeledOptions(body: string): { letter: string; text: string }[] {
  const matches: { letter: string; index: number; markerLength: number }[] = [];
  const re = /([A-D])[.)]\s+/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    if (!isOptionMarker(body, match.index)) continue;
    matches.push({
      letter: match[1].toUpperCase(),
      index: match.index,
      markerLength: match[0].length
    });
  }
  if (matches.length < 2) return [];

  return matches.map((item, i) => {
    const start = item.index + item.markerLength;
    const end = i + 1 < matches.length ? matches[i + 1].index : body.length;
    return { letter: item.letter, text: body.slice(start, end).trim().replace(/\s+/g, " ") };
  });
}

function parseBlock(number: number, block: string): ParsedLegalExamQuestion | LegalExamQuestionParseError {
  const lines = normalizeLines(block);
  if (lines.length === 0) {
    return { questionNumber: number, message: `Câu ${number}: thiếu nội dung.` };
  }

  const first = lines[0];
  const startMatch = first.match(QUESTION_START);
  const questionHead = startMatch ? first.slice(startMatch[0].length).trim() : first;

  let answerLetter: string | null = null;
  const contentLines: string[] = [];
  for (const line of lines.slice(1)) {
    const answer = line.match(ANSWER_LINE);
    if (answer) {
      answerLetter = answer[1].toUpperCase();
      continue;
    }
    contentLines.push(line);
  }

  if (!questionHead) {
    return { questionNumber: number, message: `Câu ${number}: thiếu nội dung câu hỏi.` };
  }
  if (!answerLetter) {
    return { questionNumber: number, message: `Câu ${number}: thiếu dòng "Đáp án đúng: A/B/C/D".` };
  }

  const labeled = splitLabeledOptions(contentLines.join(" "));
  let options: string[];
  let correctOptionIndex: number;

  if (labeled.length >= 2) {
    const labeledOptions = labeled.filter((item) => item.text);
    options = labeledOptions.map((item) => item.text);
    const found = labeledOptions.findIndex((item) => item.letter === answerLetter);
    correctOptionIndex = found >= 0 ? found : letterIndex(answerLetter);
  } else {
    options = contentLines.map((line) => line.replace(/^[A-Da-d][.)]\s*/, "").trim()).filter(Boolean);
    correctOptionIndex = letterIndex(answerLetter);
  }

  if (options.length < 2) {
    return { questionNumber: number, message: `Câu ${number}: cần ít nhất 2 lựa chọn.` };
  }
  if (correctOptionIndex < 0 || correctOptionIndex >= options.length) {
    return {
      questionNumber: number,
      message: `Câu ${number}: đáp án ${answerLetter} không khớp số lựa chọn (${options.length}).`
    };
  }

  return { number, text: questionHead.replace(/\s+/g, " "), options, correctOptionIndex };
}

/** Parse ngân hàng câu hỏi Word/txt theo mẫu "Câu N. ... A. ... Đáp án đúng: B". */
export function parseLegalExamQuestionsFromText(raw: string): ParseLegalExamQuestionsResult {
  const lines = normalizeLines(raw);
  const starts: { lineIndex: number; number: number }[] = [];
  for (let i = 0; i < lines.length; i += 1) {
    const match = lines[i].match(QUESTION_START);
    if (match) starts.push({ lineIndex: i, number: Number(match[1]) });
  }

  const questions: ParsedLegalExamQuestion[] = [];
  const errors: LegalExamQuestionParseError[] = [];
  if (starts.length === 0) {
    errors.push({
      questionNumber: null,
      message: 'Không tìm thấy câu hỏi nào (cần dòng bắt đầu bằng "Câu 1.").'
    });
    return { questions, errors };
  }

  for (let i = 0; i < starts.length; i += 1) {
    const from = starts[i].lineIndex;
    const to = i + 1 < starts.length ? starts[i + 1].lineIndex : lines.length;
    const block = lines.slice(from, to).join("\n");
    const parsed = parseBlock(starts[i].number, block);
    if (isParseError(parsed)) errors.push(parsed);
    else questions.push(parsed);
  }

  return { questions, errors };
}

export async function extractQuestionBankText(buffer: Buffer, originalName: string): Promise<string> {
  const name = originalName.toLowerCase();
  if (name.endsWith(".txt")) {
    return buffer.toString("utf8").replace(/^\uFEFF/, "");
  }
  if (name.endsWith(".docx")) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }
  throw new Error("UNSUPPORTED_QUESTION_BANK_FILE");
}
