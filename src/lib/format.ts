/** "김철수" -> "김**" — used wherever a reviewer's real name shouldn't be shown in full. */
export function maskName(name: string): string {
  if (name.length <= 1) return `${name}*`;
  return `${name[0]}${"*".repeat(name.length - 1)}`;
}
