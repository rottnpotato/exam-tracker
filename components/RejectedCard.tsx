"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { XCircle, AlertTriangle, Info, MessageSquare, X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface RejectedData {
  id: string
  first_name: string
  last_name: string
  coursecode: string
  status: string
  status_remarks: string
  remarks: string
  [key: string]: any
}

interface RejectedCardProps {
  data: RejectedData
}

export default function RejectedCard({ data }: RejectedCardProps) {
  const remarksText = data.status_remarks || data.remarks || "No remarks provided."
  const isLongRemarks = remarksText.length > 200

  return (
    <div className="flex justify-center items-center w-full">
      <Dialog>
        <DialogTrigger asChild>
          <Card className="cursor-pointer hover:shadow-lg transition-shadow max-w-md w-full border-red-300">
            <CardHeader className="bg-red-50 rounded-t-lg">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg text-red-700">Application Rejected</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="text-sm">
                <p className="font-medium">ID: {data.id || "N/A"}</p>
                <p className="font-medium">Name: {`${data.last_name || "N/A"}, ${data.first_name || "N/A"}`}</p>
                <p className="font-medium">Course: {data.coursecode || "N/A"}</p>
                <div className="flex items-center gap-2 mt-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <p className="text-red-600 font-medium">Status: {data.status || "Rejected"}</p>
                </div>
              </div>
              {remarksText !== "No remarks provided." && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200 mt-2">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm line-clamp-3">{remarksText}</p>
                  </div>
                  {isLongRemarks && <p className="text-xs text-right mt-1 text-red-500">Click for full details</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </DialogTrigger>
        <DialogContent className="max-w-3xl w-[95vw] p-0 max-h-[90vh] overflow-hidden">
          <div className="absolute right-4 top-4 z-20">
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </div>

          <DialogHeader className="p-6 pb-2 sticky top-0 bg-white z-10">
            <DialogTitle className="text-xl text-red-600 flex items-center gap-2 pr-8">
              <XCircle className="h-5 w-5" />
              Application Rejected
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[calc(90vh-120px)]">
            <div className="p-6 pt-2">
              {/* Details Section */}
              <div className="space-y-3 mb-6">
                <h3 className="font-semibold text-lg">Applicant Details</h3>
                <div className="grid gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-medium sm:min-w-[100px]">Name:</span>
                    <span className="break-words">{`${data.last_name || "N/A"}, ${data.first_name || "N/A"}`}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-medium sm:min-w-[100px]">ID:</span>
                    <span>{data.id || "N/A"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-medium sm:min-w-[100px]">Course:</span>
                    <span>{data.coursecode || "N/A"}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                    <span className="font-medium sm:min-w-[100px]">Status:</span>
                    <span className="text-red-600 font-medium">{data.status || "Rejected"}</span>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              {/* Rejection Details */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-red-500" />
                  Rejection Remarks
                </h3>
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                  <p className="text-base font-medium text-red-800 whitespace-pre-wrap break-all">{remarksText}</p>
                </div>
                <div className="mt-4 bg-amber-50 p-4 rounded-md border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-amber-800">What to do next?</p>
                      <p className="text-sm mt-1">
                        Please contact the admissions office for more information about your application status and
                        possible next steps. You may need to submit additional documents or apply for a different
                        program.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

