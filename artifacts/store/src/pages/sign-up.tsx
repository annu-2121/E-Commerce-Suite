import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useRegister } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setAuth } = useAuth();
  const [, navigate] = useLocation();
  const register = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await register.mutateAsync({ data: { name, email, password } });
      setAuth(result.user, result.token);
      navigate("/");
    } catch (err: any) {
      setError(err?.data?.error || "Registration failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:flex w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-primary-foreground max-w-sm">
          <h1 className="text-4xl font-serif font-bold mb-4">ShopFlow.</h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Create an account to track orders, save your cart, and get personalized recommendations.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="text-xl font-serif font-bold md:hidden block mb-6">ShopFlow.</Link>
            <h2 className="text-2xl font-bold mb-2">Create an account</h2>
            <p className="text-muted-foreground text-sm">Join ShopFlow today</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="mt-1"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={register.isPending}>
              {register.isPending ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
