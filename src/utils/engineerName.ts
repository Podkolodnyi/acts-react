export function formatEngineerName(engineer: {
  name: string;
  first_name?: string;
}): string {
  return engineer.first_name
    ? `${engineer.first_name} ${engineer.name}`
    : engineer.name;
}
