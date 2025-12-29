import { TrophySpin } from "react-loading-indicators";
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <TrophySpin
        color="#23eeff"
        size="medium"
        text="loading"
        textColor="#0ae6f9"
      />
    </div>
  );
}
