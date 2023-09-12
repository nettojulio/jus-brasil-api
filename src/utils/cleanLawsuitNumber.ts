export function cleanLawsuitNumber(input: string): string {
  return input?.trim().replace(/\D/g, '');
}
