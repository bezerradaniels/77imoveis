import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-full grid place-items-center p-6">
      <div className="w-full max-w-md rounded-xl border bg-background p-6">
        <Outlet />
      </div>
    </div>
  );
}
