import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { ShoppingBag, User as UserIcon, LogOut, PackageSearch, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGetCart, getGetCartQueryKey } from "@workspace/api-client-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { data: cart } = useGetCart({ query: { queryKey: getGetCartQueryKey(), enabled: !!user } });

  const cartItemCount = cart?.itemCount || 0;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-serif font-bold tracking-tight">
              ShopFlow.
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Catalog
              </Link>
              <Link href="/products?featured=true" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                Featured
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/cart" className="relative text-primary-foreground/80 hover:text-primary-foreground transition-colors p-2">
              <ShoppingBag className="w-5 h-5" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                    <UserIcon className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {user.role === "admin" && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer flex w-full">
                          <LayoutDashboard className="mr-2 w-4 h-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer flex w-full">
                      <PackageSearch className="mr-2 w-4 h-4" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="mr-2 w-4 h-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in" className="text-sm font-medium text-primary-foreground/80 hover:text-primary-foreground transition-colors">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {children}
      </main>

      <footer className="bg-primary text-primary-foreground border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <span className="text-xl font-serif font-bold">ShopFlow.</span>
              <p className="text-sm text-primary-foreground/60 leading-relaxed">
                Elevating the standard of online commerce. Premium products, carefully curated for the modern lifestyle.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Shop</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><Link href="/products" className="hover:text-primary-foreground">All Products</Link></li>
                <li><Link href="/products?featured=true" className="hover:text-primary-foreground">Featured</Link></li>
                <li><Link href="/products?category=new" className="hover:text-primary-foreground">New Arrivals</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><a href="#" className="hover:text-primary-foreground">FAQ</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Shipping & Returns</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-primary-foreground/60">
                <li><a href="#" className="hover:text-primary-foreground">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary-foreground">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/40">
            &copy; {new Date().getFullYear()} ShopFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
