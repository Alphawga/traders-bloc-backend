"use client";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import useUserStore from "@/store/user-store";
import { trpc } from "@/app/_providers/trpc-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect } from "react";

const requiredDocuments = [
  {
    id: 'businessName',
    label: 'Business Name',
    description: 'Official business registration document'
  },
  {
    id: 'legalAddress',
    label: 'Legal Address',
    description: 'Proof of business address'
  },
  {
    id: 'registrationNumber',
    label: 'Registration Number',
    description: 'Business registration number document'
  },
  {
    id: 'taxInformation',
    label: 'Tax Information',
    description: 'Tax registration certificate'
  },
  {
    id: 'incorporationDocuments',
    label: 'Incorporation Documents',
    description: 'Certificate of incorporation'
  }
] as const;

const kycDocumentSchema = z.array(z.object({
  document_type: z.string(),
  document_url: z.string().url(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'NOT_SUBMITTED']).default('PENDING').optional()
}));

type FormValues = z.infer<typeof kycDocumentSchema>;

function KYB() {
  const router = useRouter();
  const { user } = useUserStore();
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(kycDocumentSchema),
    defaultValues: requiredDocuments.map(doc => ({
      document_type: doc.id,
      document_url: user?.kyc_documents?.find(userDoc => userDoc.document_type === doc.id)?.document_url ?? '',
      status: user?.kyc_documents?.find(userDoc => userDoc.document_type === doc.id)?.status || 'NOT_SUBMITTED'
    }))
  });

  useEffect(() => {
    requiredDocuments.forEach((doc, index) => {
      form.setValue(`${index}`, {
        document_type: doc.id,
        document_url: user?.kyc_documents?.find(userDoc => userDoc.document_type === doc.id)?.document_url ?? '',
        status: user?.kyc_documents?.find(userDoc => userDoc.document_type === doc.id)?.status || 'NOT_SUBMITTED'
        });
      });
  }, [user, form]);

  const uploadImageMutation = trpc.uploadImage.useMutation();
  const upsertKYCDocument = trpc.upsertKYCDocument.useMutation();

  const handleFileChange = async (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    try {
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadResponse = await uploadImageMutation.mutateAsync({ file: base64File });
      
      if (uploadResponse.url) {
        const documents = Object.values(form.getValues());
        const docIndex = documents.findIndex(doc => doc.document_type === documentType);
        
        if (docIndex !== -1) {
          form.setValue(`${docIndex}`, {
            ...documents[docIndex],
            document_url: uploadResponse.url
          });
        }

        toast({
          title: "Success",
          description: "Document uploaded successfully"
        });
      }
    } catch (error) {
      console.error("Error in file upload:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to upload document"
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    const allDocumentsUploaded = data.every(doc => doc.document_url);
    
    if (!allDocumentsUploaded) {
      toast({
        title: "Warning",
        variant: "destructive",
        description: "Please upload all required documents"
      });
      return;
    }

    try {
      await upsertKYCDocument.mutateAsync(data);

      toast({
        title: "Success",
        description: "All documents submitted successfully"
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error submitting documents:', error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to submit documents"
      });
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 lg:p-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
          Upload your documents
        </h1>
        <p className="text-sm lg:text-base text-muted-foreground mt-2">
          Please upload each document as a PDF, PNG, or JPG file. Each file
          cannot exceed 10MB.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {requiredDocuments.map((doc) => (
            <FormField
              key={doc.id}
              control={form.control}
              name={`${requiredDocuments.findIndex(d => d.id === doc.id)}`}
              render={({ field }) => (
                <FormItem>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <FormLabel className="text-lg font-semibold">{doc.label}</FormLabel>
                          <p className="text-sm text-muted-foreground">{doc.description}</p>
                          <p className={`text-sm font-medium mt-1 ${
                            field.value?.status === "PENDING" ? "text-yellow-500" : 
                            field.value?.status === "APPROVED" ? "text-green-500" : 
                            field.value?.status === "REJECTED" ? "text-red-500" : 
                            "text-blue-500"
                          }`}>
                            Status: {field.value?.status?.replace(/_/g, ' ')}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <FormControl>
                            <div className="flex items-center gap-2">
                              <Input
                                title="Upload"
                                type="file"
                                id={doc.id}
                                className="hidden"
                                onChange={(e) => handleFileChange(doc.id, e)}
                                accept=".pdf,.png,.jpg,.jpeg"
                              />
                              <label htmlFor={doc.id}>
                                <Button 
                                  type="button" 
                                  variant="outline"
                                  disabled={field.value?.status === 'PENDING'}
                                  className="px-8 cursor-pointer"
                                  asChild
                                >
                                  <span>Upload</span>
                                </Button> 
                              </label>
                              {field.value?.document_url && (
                                <Image
                                  src={field.value.document_url}
                                  alt={`${doc.id} preview`}
                                  width={50}
                                  height={50}
                                  objectFit="contain"
                                />
                              )}
                            </div>
                          </FormControl>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FormItem>
              )}
            />
          ))}

          <div className="flex flex-row items-end place-content-end justify-end mt-4">
            <Button type="submit" onClick={form.handleSubmit(onSubmit)}>
              Submit
            </Button>
            
          </div>
        </form>
      </Form>
    </div>
  );
}

export default KYB;
