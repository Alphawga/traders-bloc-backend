import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { trpc } from "@/app/_providers/trpc-provider";
import { useToast } from "@/hooks/use-toast";
import { milestoneSchema } from "@/lib/dtos";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";

type MilestoneFormValues = z.infer<typeof milestoneSchema>;

interface CreateMilestoneFormProps {
  invoice_id: string;
  is_milestone?: boolean;
  onSuccess?: () => void;
}

function CreateMilestoneForm({ invoice_id, onSuccess, is_milestone }: CreateMilestoneFormProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(is_milestone);
  const [previewUrl, setPreviewUrl] = useState<string | null>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingAndContinue, setIsSubmittingAndContinue] = useState(false);

  const utils = trpc.useUtils();

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneSchema),
    defaultValues: {
      description: "",
      supporting_doc: "",
      bank_account_no: "",
      bank_name: "",
      due_date: new Date(),
      payment_amount: 0,
      invoice_id,
      id: undefined,

    },
  });

  const resetForm = () => {
    form.reset({
      id: undefined,
      title:"",
      description: "",
      supporting_doc: "",
      bank_account_no: "",
      bank_name: "",
      due_date: new Date(),
      invoice_id,
      payment_amount: 0
    });
    setPreviewUrl("");
  };

  const addMilestone = trpc.createMilestone.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "Milestone added successfully"
      });
      utils.getUserData.invalidate();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message
      });
    },
  });

  const uploadImageMutation = trpc.uploadImage.useMutation({
    onSuccess: (res) => {
      console.log("Upload successful:", res.url);
    },
    onError: (error) => {
      console.error("Error uploading to Cloudinary:", error);
    },
  });

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0];
    if (file) {
      try {
        const base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const response = await uploadImageMutation.mutateAsync({ file: base64File });
        if (response.url) {
          console.log("Image uploaded", response.url)
          form.setValue("supporting_doc", response.url);
          setPreviewUrl(response.url);
        }
      } catch (error) {
        console.error("Error in file upload:", error);
      }
    }
  }

  const onSubmit = async (data: MilestoneFormValues, addAnother: boolean) => {
    if (isSubmitting) return;
    if (isSubmittingAndContinue) return;
    
    console.log("Submit button clicked", data);
    
    try {
      if (addAnother) {
        setIsSubmitting(true);
      await addMilestone.mutateAsync({ ...data, invoice_id });
      
        resetForm();
      } else {
setIsSubmittingAndContinue(true)
        await addMilestone.mutateAsync({ ...data, invoice_id });
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Add Milestone</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px] lg:max-w-[500px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add New Milestone</DialogTitle>
          <DialogDescription>
            Add details to milestone here
          </DialogDescription>
        </DialogHeader>
        <div className="flex-grow overflow-y-auto pr-4 mx-5">
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
        
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bank_account_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank Account No</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="due_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : ''}
                        onChange={(e) => field.onChange(new Date(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
      
                    <FormField
                control={form.control}
                name="supporting_doc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Milestone Supporting document</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="file"
                          {...field}
                          value={undefined}
                          onChange={handleFileChange}
                          accept="image/*,.pdf"
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        />
                        {previewUrl && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(previewUrl, '_blank')}
                          >
                            View File
                          </Button>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                    {previewUrl && (
                      <div className="mt-2">
                        <p className="text-sm font-medium mb-1">Preview:</p>
                        <Image
                          src={previewUrl}
                          alt="Invoice preview"
                          width={200}
                          height={200}
                          objectFit="contain"
                        />
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter className="mt-4 flex justify-end space-x-2">
        <Button 
            variant="outline"
            disabled={isSubmitting}
            onClick={() => form.handleSubmit((data) => onSubmit(data, true))()}
          >
            {isSubmitting ? 'Submitting...' : 'Submit and Add Another'}
          </Button>
          <Button 
            disabled={isSubmitting}
            onClick={() => form.handleSubmit((data) => onSubmit(data, false))()}
          >
            {isSubmittingAndContinue ? 'Submitting...' : 'Submit and Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default CreateMilestoneForm;