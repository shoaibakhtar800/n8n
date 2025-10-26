"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useSocialProvider } from "@/hooks/use-social-provider";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .max(255, "Email must be at most 255 characters")
    .email("Please enter a valid email address"),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()[\]{}<>~_+=|:;.,-]).{8,}$/,
      "Password must include uppercase, lowercase, number, and special character"
    ),
});

type LoginFormValue = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const { gitHubSignIn, googleSignIn, loading } = useSocialProvider();

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValue) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (error) => {
          toast.error(
            error.error.message || "Failed to login. Please try again."
          );
        },
      }
    );
  };

  const isPending = form.formState.isSubmitting;

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle>Welcome Back!</CardTitle>
          <CardDescription>
            Enter your email and password to access your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending || loading}
                    onClick={gitHubSignIn}
                  >
                    <Image
                      src="github.svg"
                      width={20}
                      height={20}
                      alt="GitHub"
                    />
                    Continue with GitHub
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    type="button"
                    disabled={isPending || loading}
                    onClick={googleSignIn}
                  >
                    <Image
                      src="google.svg"
                      width={20}
                      height={20}
                      alt="Google"
                    />
                    Continue with Google
                  </Button>
                </div>
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="m@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="********"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={isPending || loading}>
                    {isPending ? (
                      <>
                        <Spinner /> Logging in...
                      </>
                    ) : (
                      "Login"
                    )}
                  </Button>
                </div>
                <div className="text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
