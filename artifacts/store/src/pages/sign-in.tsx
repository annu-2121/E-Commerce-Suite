import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setAuth } = useAuth();
  const [, navigate] = useLocation();
  const login = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const result = await login.mutateAsync({ data: { email, password } });
      setAuth(result.user, result.token);
      navigate("/");
    } catch (err: any) {
      setError(err?.data?.error || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden md:flex w-1/2 bg-primary items-center justify-center p-12">
        <div className="text-primary-foreground max-w-sm">
          <h1 className="text-4xl font-serif font-bold mb-4">ShopFlow.</h1>
          <p className="text-primary-foreground/70 text-lg leading-relaxed">
            Sign in to access your orders, manage your cart, and enjoy a personalized shopping experience.
          </p>
          <div className="mt-8 space-y-3">
            {["Free shipping on orders over $75", "30-day hassle-free returns", "Secure & encrypted checkout"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-primary-foreground/80">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-foreground/60" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <Link href="/" className="text-xl font-serif font-bold md:hidden block mb-6">ShopFlow.</Link>
            <h2 className="text-2xl font-bold mb-2">Welcome back</h2>
            <p className="text-muted-foreground text-sm">Enter your credentials to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 px-3 py-2 rounded-md">{error}</p>
            )}

            <Button type="submit" className="w-full" disabled={login.isPending}>
              {login.isPending ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-foreground font-medium hover:underline">
              Sign up
            </Link>
          </p>

          <div className="mt-4 p-3 bg-muted rounded-md text-xs text-muted-foreground">
            <p className="font-medium mb-1">Demo accounts:</p>
            <p>Admin: admin@shopflow.com / admin123</p>
            <p>User: user@shopflow.com / user123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
