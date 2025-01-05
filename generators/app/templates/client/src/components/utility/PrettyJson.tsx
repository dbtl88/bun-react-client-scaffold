export function PrettyJson(json: any) {
  return (
    <pre className="text-left whitespace-pre-wrap break-words">{JSON.stringify(json, null, 2)}</pre>
  );
}