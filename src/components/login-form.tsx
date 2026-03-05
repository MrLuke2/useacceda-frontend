import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Shield } from "lucide-react"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Simulate login success and redirect
    const { from, action } = (location.state as any) || { from: "/audits" }
    navigate(from, { state: { action } })
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="border-primary/10 bg-card/50 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center space-y-1">
          <div className="flex justify-center mb-4">
            <div className="bg-primary rounded-xl p-2.5 shadow-lg shadow-primary/20">
              <Shield className="h-6 w-6 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  className="bg-background/50 h-11"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required className="bg-background/50 h-11" />
              </div>
              <Button type="submit" className="w-full h-11 font-semibold shadow-lg shadow-primary/20 active:scale-95 transition-all">
                Login
              </Button>
            </div>
            <div className="mt-6 text-center text-sm">
              Don&apos;t have an account?{" "}
              <a href="#" className="font-semibold text-primary hover:underline underline-offset-4">
                Contact Sales
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-center text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-60">
        SOC 2 Type I &middot; FedRAMP Ready &middot; HIPAA Compliant
      </div>
    </div>
  )
}
