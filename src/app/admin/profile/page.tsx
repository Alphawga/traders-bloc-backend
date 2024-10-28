"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { useEffect } from "react";
import { adminUpdateSchema } from "@/lib/dtos";




type AdminUpdateSchema = z.infer<typeof adminUpdateSchema>;

function AdminProfile() {
  const { data: admin, isLoading } = trpc.getAdminProfile.useQuery();

  const form = useForm<AdminUpdateSchema>({
    resolver: zodResolver(adminUpdateSchema),
    defaultValues: {
      id: "",
      email: "",
      name: "",
      current_password: "",
      new_password: "",
    },
  });

  useEffect(() => {
    if (admin) {
      form.reset({
        id: admin.id,
        email: admin.email,
        name: admin.name,
      });
    }
  }, [admin, form]);

  const updateAdminMutation = trpc.updateAdminData.useMutation({
    onSuccess: () => {
      toast({
        title: "Admin profile updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update admin profile",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (values: AdminUpdateSchema) => {
    try {
      await updateAdminMutation.mutateAsync(values);
    } catch (error) {
      console.error("Failed to update admin profile:", error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <main>
      <section className="">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs defaultValue="profile">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profile">Your Profile</TabsTrigger>
                <TabsTrigger value="password">Password</TabsTrigger>
              </TabsList>
              <TabsContent value="profile">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>
                      Make changes to your admin profile here.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@admin.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                   
                  </CardContent>
                  <CardFooter>
                    <Button
                      type="submit"
                      className="w-[20%]"
                      disabled={updateAdminMutation.isLoading}
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
                      disabled={updateAdminMutation.isLoading}
                    >
                      Save changes
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </form>
        </Form>
      </section>
    </main>
  );
}

export default AdminProfile;