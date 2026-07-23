export default function ErrorState({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-lg border border-red-300 bg-red-50 px-4 py-4">
      <p className="font-semibold text-red-900">Something went wrong</p>
      <p className="mt-1 text-sm text-red-900">{message}</p>
    </div>
  );
}
