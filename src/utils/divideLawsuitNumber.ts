export function divideLawsuitNumber(input: string): Array<string> {
  const partes = [
    input?.slice(0, 13),
    input?.slice(13, 14),
    input?.slice(14, 16),
    input?.slice(16),
  ];
  return partes;
}
