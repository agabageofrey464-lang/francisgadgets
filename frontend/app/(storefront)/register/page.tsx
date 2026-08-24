"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Input";
import { ApiError, apiFetch } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);

  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify(form),
      });
      const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (res?.error) {
        toast.error("Account created -- please sign in.");
        router.push("/login");
        return;
      }
      toast.success("Account created!");
      router.push("/");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? String(err.detail) : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12 sm:px-6">
      <h1 className="mb-1 text-2xl font-bold text-ink-900">Create your account</h1>
      <p className="mb-6 text-sm text-gray-500">Join Francis Gadgets Technologies</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <Label htmlFor="full_name">Full name</Label>
          <Input id="full_name" required value={form.full_name} onChange={update("full_name")} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={form.email} onChange={update("email")} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" value={form.phone} onChange={update("phone")} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            minLength={8}
            required
            value={form.password}
            onChange={update("password")}
          />
        </div>
        <Button type="submit" className="w-full" isLoading={loading}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
