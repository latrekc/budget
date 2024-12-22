import { Progress } from "@nextui-org/react";

export default function Loading() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      <Progress
        className="max-w-md"
        color="primary"
        isIndeterminate
        label="Loading..."
        size="lg"
      />
    </div>
  );
}
