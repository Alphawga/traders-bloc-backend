"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
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
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Clock, Upload, Loader2 } from "lucide-react";

const businessNameKYC = {
  id: "businessName",
  label: "Means Of Identification",
  description:
    "Upload one of the following: (National ID Card, Driver's License, International Passport, BVN)",
  maxSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: [".pdf", ".png", ".jpg", ".jpeg"],
};

const legalAddressKYC = {
  id: "legalAddress",
  label: "Business",
  description: "Upload the CAC registration certificate",
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: [".pdf", ".png", ".jpg", ".jpeg"],
};

const registrationNumberKYC = {
  id: "registrationNumber",
  label: "MERMART (Optional)",
  description: "MEMART (for Limited Liability Companies)",
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: [".pdf", ".png", ".jpg", ".jpeg"],
};

const taxInformationKYC = {
  id: "taxInformation",
  label: "Partnership Agreement (Optional)",
  description: "Partnership Agreement (for Limited Liability Companies)",
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: [".pdf", ".png", ".jpg", ".jpeg"],
};

const incorporationDocumentsKYC = {
  id: "incorporationDocuments",
  label: "CAC Approved Constitition (Optional)",
  description: "CAC approved constitition of the organization",
  maxSize: 10 * 1024 * 1024,
  acceptedFormats: [".pdf", ".png", ".jpg", ".jpeg"],
};

const requiredDocuments = [
  businessNameKYC,
  legalAddressKYC,
  registrationNumberKYC,
  taxInformationKYC,
  incorporationDocumentsKYC,
];

// const requiredDocumentChecker = [businessNameKYC, legalAddressKYC];

const kycDocumentSchema = z.object({
  businessName: z.string(),
  legalAddress: z.string(),
  registrationNumber: z.string().optional(),
  taxInformation: z.string().optional(),
  incorporationDocuments: z.string().optional(),
});

const companyDetailsSchema = z.object({
  company_name: z.string(),
  business_address: z.string(),
  business_description: z.string(),
  business_ownership_percentage: z.coerce.number().min(0).max(100),
  source_of_wealth: z.string(),
});

type FormValues = z.infer<typeof kycDocumentSchema>;

export default function KYB() {
  const { user } = useUserStore();
  const { toast } = useToast();
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Company Details Form
  const companyForm = useForm<z.infer<typeof companyDetailsSchema>>({
    resolver: zodResolver(companyDetailsSchema),
    defaultValues: {
      company_name: user?.company_name || "",
      business_address: user?.business_address || "",
      business_description: user?.business_description || "",
      business_ownership_percentage: user?.business_ownership_percentage || undefined,
      source_of_wealth: user?.source_of_wealth || "",
    },
  });

  // Documents Form
  const documentsForm = useForm<FormValues>({
    resolver: zodResolver(kycDocumentSchema),
    defaultValues: {
      businessName: "",
      legalAddress: "",
      registrationNumber: "",
      taxInformation: undefined,
      incorporationDocuments: undefined,
    },
  });

  // Mutations
  const updateCompanyDetails = trpc.updateCompanyDetails.useMutation();
  const uploadImageMutation = trpc.uploadImage.useMutation();
  const upsertKYCDocument = trpc.upsertKYCDocument.useMutation();

  // Calculate progress
  useEffect(() => {
    const companyValues = Object.values(companyForm.getValues()).filter(Boolean).length;
    const documentValues = Object.values(documentsForm.getValues()).filter(Boolean).length;
    const totalFields = Object.keys(companyForm.getValues()).length + requiredDocuments.length;
    setProgress(((companyValues + documentValues) / totalFields) * 100);
  }, [companyForm, documentsForm]);

  // Handle file upload
  const handleFileChange = async (documentType: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const docConfig = requiredDocuments.find((doc) => doc.id === documentType);
    if (!docConfig) return;

    if (file.size > docConfig.maxSize) {
      toast({
        title: "Error",
        description: `File size exceeds the maximum limit of ${
          docConfig.maxSize / (1024 * 1024)
        }MB`,
        variant: "destructive",
      });
      return;
    }

    if (
      !docConfig.acceptedFormats.some((format) =>
        file.name.toLowerCase().endsWith(format)
      )
    ) {
      toast({
        title: "Error",
        description: `Invalid file format. Accepted formats are: ${docConfig.acceptedFormats.join(
          ", "
        )}`,
        variant: "destructive",
      });
      return;
    }

    try {
      const base64File = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const uploadResponse = await uploadImageMutation.mutateAsync({
        file: base64File,
      });

      if (uploadResponse.url) {
        documentsForm.setValue(documentType as keyof FormValues, uploadResponse.url);
        toast({
          title: "Success",
          description: "Document uploaded successfully",
        });
        // Reset the file input
        event.target.value = "";
      }
    } catch (error) {
      console.error("Error in file upload:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
        variant: "destructive",
      });
    }
  };

  // Combined submit handler
  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Submit company details
      await updateCompanyDetails.mutateAsync({
        id: user?.id as string,
        ...companyForm.getValues(),
      });

      // Submit documents
      const documentData = documentsForm.getValues();
      const payload = Object.entries(documentData)
        .filter(([, value]) => value)
        .map(([key, value]) => ({
          document_type: key,
          document_url: value,
          status: "PENDING" as const,
        }));

      await upsertKYCDocument.mutateAsync(payload);

      // Invalidate queries and update session
      const utils = trpc.useUtils();
      await utils.getUserData.invalidate();
      await fetch('/api/auth/session?update=true');

      toast({
        title: "Success",
        description: "Profile and documents submitted successfully",
      });

      router.push('/dashboard');
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "Failed to submit information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
          <p className="text-muted-foreground">
            Please provide your business details and required documents
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Completion Progress</h2>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% complete
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>

          <div className="space-y-8">
            {/* Company Details Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              <Form {...companyForm}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={companyForm.control}
                    name="company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="business_address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter business address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="business_description"
                    render={({ field }) => (
                      <FormItem className="sm:col-span-2">
                        <FormLabel>Business Description</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Describe your business activities" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="business_ownership_percentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ownership Percentage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter ownership percentage" 
                            min="0"
                            max="100"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={companyForm.control}
                    name="source_of_wealth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Source of Wealth</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter source of wealth" 
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </Form>
            </div>

            {/* Documents Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
              <Form {...documentsForm}>
                <div className="space-y-4">
                  {requiredDocuments.map((doc) => (
                    <FormField
                      key={doc.id}
                      control={documentsForm.control}
                      name={doc.id as keyof FormValues}
                      render={({ field }) => (
                        <FormItem>
                          <Card>
                            <CardContent className="p-4">
                              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="flex-1">
                                  <FormLabel className="text-lg font-semibold">
                                    {doc.label}
                                  </FormLabel>
                                  <p className="text-sm text-muted-foreground">
                                    {doc.description}
                                  </p>
                                  <div className="flex items-center mt-2">
                                    <Badge
                                      variant={
                                        field.value ? "default" : "secondary"
                                      }
                                      className="mr-2"
                                    >
                                      {field.value ? (
                                        <>
                                          <CheckCircle2 className="w-4 h-4 mr-1" />
                                          Uploaded
                                        </>
                                      ) : (
                                        <>
                                          <AlertCircle className="w-4 h-4 mr-1" />
                                          Not Uploaded
                                        </>
                                      )}
                                    </Badge>
                                    {field.value && (
                                      <Badge variant="outline">
                                        <Clock className="w-4 h-4 mr-1" />
                                        Pending Review
                                      </Badge>
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-4">
                                  <FormControl>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="file"
                                        id={`${doc.id}-input`}
                                        className="hidden"
                                        onChange={(e) =>
                                          handleFileChange(doc.id, e)
                                        }
                                        accept={doc.acceptedFormats.join(",")}
                                      />
                                      <Button
                                        type="button"
                                        variant="outline"
                                        className="cursor-pointer"
                                        onClick={() =>
                                          document
                                            .getElementById(`${doc.id}-input`)
                                            ?.click()
                                        }
                                      >
                                        <Upload className="w-4 h-4 mr-2" />
                                        {field.value ? "Replace" : "Upload"}
                                      </Button>
                                      {field.value && (
                                        <Image
                                          src={field.value}
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </Form>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <Button 
              onClick={onSubmit} 
              size="lg" 
              disabled={isSubmitting }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Profile'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
