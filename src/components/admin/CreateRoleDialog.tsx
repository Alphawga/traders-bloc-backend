'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { trpc } from "@/app/_providers/trpc-provider"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createRoleSchema, type CreateRoleInput } from "@/lib/dtos"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CreateRoleDialogProps {
  onSuccess?: () => void
}

export function CreateRoleDialog({ onSuccess }: CreateRoleDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openPermissions, setOpenPermissions] = useState(false)
  const { toast } = useToast()
  const { data: permissions } = trpc.getAllPermissions.useQuery()

  const form = useForm<CreateRoleInput>({
    resolver: zodResolver(createRoleSchema),
    defaultValues: {
      name: "",
      permissions: [],
    },
  })

  const { mutate: createRole, isLoading } = trpc.createRole.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Role created successfully",
      })
      setIsOpen(false)
      form.reset()
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: CreateRoleInput) => {
    createRole(data)
  }

  const selectedPermissions = form.watch('permissions')

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create New Role</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Role</DialogTitle>
          <DialogDescription>
            Create a new role and assign permissions
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="ROLE_NAME" 
                      {...field} 
                      onChange={e => field.onChange(e.target.value.toUpperCase())}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Permissions</FormLabel>
                  <Popover open={openPermissions} onOpenChange={setOpenPermissions}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value?.length > 0
                            ? `${field.value.length} permissions selected`
                            : "Select permissions"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0">
                      <Command>
                        <CommandInput placeholder="Search permissions..." />
                        <CommandEmpty>No permissions found.</CommandEmpty>
                        <CommandGroup>
                          <ScrollArea className="h-72">
                            {permissions?.map((permission) => (
                              <CommandItem
                                key={permission.id}
                                onSelect={() => {
                                  const newValue = field.value.includes(permission.id)
                                    ? field.value.filter(x => x !== permission.id)
                                    : [...field.value, permission.id]
                                  field.onChange(newValue)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    field.value.includes(permission.id) 
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {permission.module} - {permission.action}
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPermissions.map((permId) => {
                      const perm = permissions?.find(p => p.id === permId)
                      return (
                        <Badge 
                          key={permId}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => {
                            field.onChange(selectedPermissions.filter(id => id !== permId))
                          }}
                        >
                          {perm?.module} - {perm?.action}
                          <span className="ml-1">×</span>
                        </Badge>
                      )
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 