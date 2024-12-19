'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { trpc } from "@/app/_providers/trpc-provider"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface EntityNotesProps {
  entityId: string
  entityType: 'milestone' | 'invoice' | 'funding_request' | 'kyc'
  onNoteAdded?: () => void
}

export function EntityNotes({ entityId, entityType, onNoteAdded }: EntityNotesProps) {
  const [note, setNote] = useState('')
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const { data: notes, refetch } = trpc.getNotes.useQuery({ 
    entity_id: entityId,
    entity_type: entityType
  })

  const uploadImageMutation = trpc.uploadImage.useMutation({
    onSuccess: (res) => {
      console.log("Upload successful:", res.url)
    },
    onError: (error) => {
      console.error("Error uploading to Cloudinary:", error)
      toast({
        description: "Failed to upload file",
        variant: "destructive"
      })
    },
  })

  const addNote = trpc.addNote.useMutation({
    onSuccess: () => {
      toast({ description: "Note added successfully" })
      setNote('')
      setPreviewUrls([])
      refetch()
      onNoteAdded?.()
    },
    onError: (error) => {
      toast({ 
        description: error.message || "Failed to add note", 
        variant: "destructive" 
      })
    }
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const uploadedUrls: string[] = []

    try {
      for (const file of files) {
        const base64File = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(reader.result as string)
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const response = await uploadImageMutation.mutateAsync({ file: base64File })
        if (response.url) {
          uploadedUrls.push(response.url)
        }
      }

      setPreviewUrls(prev => [...prev, ...uploadedUrls])
    } catch (error) {
      console.error("Error in file upload:", error)
      toast({
        description: "Failed to upload one or more files",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async () => {
    if (!note.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await addNote.mutateAsync({
        entity_id: entityId,
        entity_type: entityType,
        content: note,
        attachments: previewUrls
      })
    } catch (error) {
      console.error("Error submitting note:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const removePreview = (index: number) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        <div className="flex gap-2">
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            accept="image/*,.pdf"
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
          />
          <Button 
            onClick={handleSubmit}
            disabled={!note.trim() || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </Button>
        </div>

        {/* Preview Section */}
        {previewUrls.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-sm font-medium">Attachments:</p>
            <div className="flex flex-wrap gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative">
                  {url.toLowerCase().endsWith('.pdf') ? (
                    <div className="flex items-center space-x-2">
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        View PDF
                      </a>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removePreview(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Image
                        src={url}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="object-cover rounded"
                      />
                      <Button
                        size="sm"
                        variant="destructive"
                        className="absolute top-0 right-0 m-1"
                        onClick={() => removePreview(index)}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {notes?.map((note) => (
          <Card key={note.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">
                  {note.admin.name} • {format(new Date(note.created_at), 'MMM dd, yyyy HH:mm')}
                </p>
                <p className="mt-1">{note.content}</p>
                {note.attachments.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-4">
                    {note.attachments.map((url, index) => (
                      <div key={index}>
                        {url.toLowerCase().endsWith('.pdf') ? (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline"
                          >
                            View PDF
                          </a>
                        ) : (
                          <Image
                            src={url}
                            alt={`Attachment ${index + 1}`}
                            width={100}
                            height={100}
                            className="object-cover rounded cursor-pointer"
                            onClick={() => window.open(url, '_blank')}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
} 