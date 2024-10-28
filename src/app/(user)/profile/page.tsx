"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import useUserStore from "@/store/user-store";
import { trpc } from "@/app/_providers/trpc-provider";
import { toast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { userUpdateSchema } from "@/lib/dtos";
import { useEffect } from "react";




function Profile() {
  const { user } = useUserStore();

  const form = useForm<z.infer<typeof userUpdateSchema>>({
    resolver: zodResolver(userUpdateSchema),
    defaultValues: {
      id: user?.id || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
      email: user?.email || "",
      phone_number: user?.phone_number || "",
      company_name: user?.company_name || "",
      tax_id: user?.tax_id || "",
      industry: user?.industry || "",
      current_password: "",
      new_password: "",
    },
  });

  useEffect(()=>{
  if(user){
  form.setValue("first_name", user.first_name);
  form.setValue("last_name", user.last_name);
  form.setValue("email", user.email);
  form.setValue("phone_number", user.phone_number);
  form.setValue("company_name", user.company_name);
  form.setValue("tax_id", user.tax_id);
  form.setValue("industry", user.industry);
  }
  },[user, form])

  const updateUserMutation = trpc.updateUser.useMutation({
    onSuccess: () => {
      toast({
        title: "User updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: z.infer<typeof userUpdateSchema>) => {

    try {
      await updateUserMutation.mutateAsync({ ...values, id: user?.id as string});
    } catch (error) {
      console.error("Failed to update user:", error);
    }
  };

  return (
    <main>
      <section className="">
       
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="profile">Your Profile</TabsTrigger>
                <TabsTrigger value="company">Company</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
                <TabsTrigger value="2fa">Two-Factor Auth</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                      Make changes to your personal information here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john.doe@company.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Phone number</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Phone number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-[20%]"
                      disabled={updateUserMutation.isLoading}
                    >
                      Save changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="company">
                <Card>
                  <CardHeader>
                    <CardTitle>Company</CardTitle>
                    <CardDescription>
                      Make changes to your company information here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="company_name"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Acme Corporation" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-[20%]"
                      disabled={updateUserMutation.isLoading}
                    >
                      Save changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="password">
                <Card>
                  <CardHeader>
                    <CardTitle>Password</CardTitle>
                    <CardDescription>
                      Change your password here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex space-x-4">
                      <FormField
                        control={form.control}
                        name="current_password"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="new_password"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="********" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-[20%]"
                      disabled={updateUserMutation.isLoading}
                    >
                      Save changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              <TabsContent value="2fa">
                {/* 2FA content */}
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </section>
    </main>
  );
}

export default Profile;
