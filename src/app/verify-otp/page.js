"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

function OTP() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(
          data.message || "Verification failed"
        );
        return;
      }

      // Save login information
      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      toast.success(
        "Account verified! Login successful"
      );

      if (
        data.user?.role?.toLowerCase() ===
        "admin"
      ) {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resendOTP = async () => {
    try {
      setResending(true);

      const res = await fetch(
        "/api/resend-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("New OTP sent");
    } catch (error) {
      toast.error("Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">

      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md space-y-5"
      >

        <h2 className="text-2xl font-bold text-center">
          Verify Email
        </h2>

        <p className="text-center text-gray-500 text-sm">
          OTP sent to:
          <br />
          <b>{email}</b>
        </p>

        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value.replace(/\D/g, "")
            )
          }
          placeholder="Enter 6-digit OTP"
          className="w-full border rounded-lg px-4 py-3 text-center text-xl tracking-[8px]"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading
            ? "Verifying..."
            : "Verify Email"}
        </button>

        <button
          type="button"
          onClick={resendOTP}
          disabled={resending}
          className="w-full border border-black py-2 rounded-lg"
        >
          {resending
            ? "Sending..."
            : "Resend OTP"}
        </button>

      </form>
    </div>
  );
}

export default function verifyOTP(){
  return(
    <Suspense
    fallback={
        <p className="text-center mt-10 text-lg">
          Loading...
        </p>
      }>
      <OTP />
    </Suspense>
  )
}