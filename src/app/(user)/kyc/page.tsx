"use client";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import useUserStore from "@/store/user-store";
import { trpc } from "@/app/_providers/trpc-provider";
import { Input } from "@/components/ui/input";
import PageBreadcrumb from "@/components/page-breadcrumb";
import { Button } from "@/components/ui/button";

type DocumentType = 'businessName' | 'legalAddress' | 'registrationNumber' | 'taxInformation' | 'incorporationDocuments';

function KYB() {
  const router = useRouter();
  const { user } = useUserStore();
  const { toast } = useToast();
  const [uploads, setUploads] = useState({
    businessName: user?.kyc_documents?.find(doc => doc.document_type === 'businessName')?.document_url || null,
    legalAddress: user?.kyc_documents?.find(doc => doc.document_type === 'legalAddress')?.document_url || null,
    registrationNumber: user?.kyc_documents?.find(doc => doc.document_type === 'registrationNumber')?.document_url || null,
    taxInformation: user?.kyc_documents?.find(doc => doc.document_type === 'taxInformation')?.document_url || null,
    incorporationDocuments: user?.kyc_documents?.find(doc => doc.document_type === 'incorporationDocuments')?.document_url || null,
  });

  const [documentStatuses, setDocumentStatuses] = useState({
    businessName: 'Not Submitted',
    legalAddress: 'Not Submitted',
    registrationNumber: 'Not Submitted',
    taxInformation: 'Not Submitted',
    incorporationDocuments: 'Not Submitted',
  });

  const uploadImageMutation = trpc.uploadImage.useMutation({
    onSuccess: (res) => {
      console.log("Upload successful:", res.url);
    },
    onError: (error) => {
      console.error("Error uploading to Cloudinary:", error);
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to upload file"
      });
    },
  });

  const upsertKYCDocument = trpc.upsertKYCDocument.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        variant: "default",
        description: "KYC document updated successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: error.message
      });
    },
  });

  const handleFileChange = async (documentType: DocumentType, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
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
          console.log("Image uploaded", response.url);
          setUploads(prevUploads => ({ ...prevUploads, [documentType]: response.url }));
          setDocumentStatuses(prevStatuses => ({ ...prevStatuses, [documentType]: 'PENDING' }));

          // Upsert KYC document
          await upsertKYCDocument.mutateAsync({
            document_type: documentType,
            document_url: response.url
          });
        }
      } catch (error) {
        console.error("Error in file upload:", error);
      }
    }
  };

  const handleSubmit = () => {
    
    router.push('/invoices');
  };

  return (
    <div className="w-full h-full">
      {/* Breadcrumb */}
      <div className="p-4 lg:p-8">
        <PageBreadcrumb />
      </div>

      <div className="w-full lg:w-[80%] mx-auto p-4 lg:p-8 flex flex-col items-center justify-center mb-4">
        <p className="text-2xl lg:text-3xl font-extrabold text-center lg:text-left tracking-tight">
          Upload your documents
        </p>
        <p className="text-sm lg:text-base text-text_light m-2 w-full lg:w-[70%] text-center mb-5">
          Please upload each document as a PDF, PNG, or JPG file. Each file
          cannot exceed 10MB. If you have any questions, please see our FAQ.
        </p>
        <div className="w-full lg:w-[80%] flex flex-col gap-8 mt-8">
          {(Object.keys(uploads) as Array<DocumentType>).map((key) => (
            <div key={key} className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
              <div className="flex flex-col mb-2 lg:mb-0">
                <p className="text-text text-lg tracking-tight">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </p>
                <p className="text-sm text-text_light">
                  {uploads[key] ? "File uploaded" : "No file uploaded"}
                </p>
                <p className={`text-sm font-bold ${
                  documentStatuses[key] === "PENDING" ? "text-yellow-500" : 
                  documentStatuses[key] === "APPROVED" ? "text-green-500" : 
                  documentStatuses[key] === "REJECTED" ? "text-red-500" : 
                  "text-blue-500"
                }`}>
                  Status: {documentStatuses[key]}
                </p>
              </div>
              <div className="flex flex-col lg:flex-row items-center">
                <Input
                  title="Upload"
                  type="file"
                  id={key}
                  className="hidden"
                  onChange={(e) => handleFileChange(key, e)}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
                <label htmlFor={key}>
                  <Button type="button"
                  className="px-8 cursor-pointer mb-2 lg:mb-0 lg:mr-2">

                    Upload
                    </Button> 
                </label>
                {uploads[key] && (
                  <div className="mt-2 lg:mt-0">
                    <Image
                      src={uploads[key]!}
                      alt={`${key} preview`}
                      width={50}
                      height={50}
                      objectFit="contain"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <div className="flex flex-row items-end place-content-end justify-end mt-4">
            <Button type="submit" onClick={handleSubmit}>
              Submit
            </Button>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default KYB;
