import answers from '../data/answers.json';

export default answers.map(e => e.word);
export const hints = answers.map(e => e.hint);
