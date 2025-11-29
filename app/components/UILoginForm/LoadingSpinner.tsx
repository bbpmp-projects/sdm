// app/components/UI/LoadingSpinner.tsx
interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({ text = "Memproses..." }: LoadingSpinnerProps) {
  return (
    <>
      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span className="font-medium">{text}</span>
    </>
  );
}