import React from "react";
import { Calendar, Eye, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getStatusBadgeColor, getStatusText, formatDate } from "@/lib/utils";
import type { PublicComplaint, Response } from "@shared/schema";

interface ComplaintCardProps {
  complaint: PublicComplaint;
  category?: string;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({
  complaint,
  category = "Umum",
}) => {
  // Find the admin response (if any)
  const adminResponse = complaint.responses?.find(response => response.isFromAdmin);
  
  // Find the latest citizen response after admin response (if any)
  let latestCitizenResponse: Response | undefined;
  if (adminResponse) {
    latestCitizenResponse = complaint.responses?.find(
      response => !response.isFromAdmin && new Date(response.createdAt) > new Date(adminResponse.createdAt)
    );
  }
  
  let statusVariant: "warning" | "success" | "info" = "info";
  
  switch (complaint.status) {
    case "resolved":
      statusVariant = "success";
      break;
    case "verified":
    case "inprogress":
      statusVariant = "warning";
      break;
    default:
      statusVariant = "info";
  }

  // Status display text
  const statusDisplay = getStatusText(complaint.status);

  return (
    <Card className="bg-white rounded-lg shadow-md mb-6 overflow-hidden hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
      <CardHeader className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-b border-neutral-medium">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <h3 className="font-bold text-lg text-primary">{complaint.title}</h3>
            <div className="flex flex-wrap items-center text-sm text-neutral-dark mt-2 gap-2">
              <Badge variant="info" className="mr-1 text-xs font-medium px-2.5 py-0.5">{category}</Badge>
              <span className="flex items-center text-neutral-dark/70"><Calendar className="h-4 w-4 mr-1" /> {formatDate(complaint.createdAt)}</span>
              <span className="mx-1 hidden sm:inline text-neutral-dark/30">•</span>
              <span className="flex items-center text-neutral-dark/70"><Eye className="h-4 w-4 mr-1" /> 0 dilihat</span>
            </div>
          </div>
          <Badge variant={statusVariant} className="px-3 py-1.5 rounded-md text-sm font-medium shadow-sm">
            {statusDisplay}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-5">
        <p className="text-neutral-dark mb-4 leading-relaxed">{complaint.description}</p>
        
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4">
            {complaint.attachments.slice(0, 2).map((attachment, index) => (
              <div key={index} className="relative group">
                <img
                  src={`/api/attachments/${attachment.filename}`}
                  alt={`Bukti ${index + 1}`}
                  className="h-28 w-auto rounded-md shadow-sm group-hover:shadow-md transition-all"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            ))}
            {complaint.attachments.length > 2 && (
              <div className="h-28 w-28 flex items-center justify-center bg-neutral-100 rounded-md text-neutral-500 font-medium hover:bg-neutral-200 transition-colors cursor-pointer shadow-sm">
                +{complaint.attachments.length - 2} lainnya
              </div>
            )}
          </div>
        )}
        
        {/* Responses section */}
        {adminResponse && (
          <div className="border-t border-neutral-medium/50 pt-4 mt-3">
            <h4 className="text-sm font-medium text-neutral-dark mb-3">Tanggapan Terakhir</h4>
            <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
              <div className="flex items-start">
                <div className="bg-secondary text-white p-2 rounded-full mr-3 shadow-sm">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <p className="font-medium text-secondary">Admin Pemerintah</p>
                    <p className="text-xs text-neutral-dark/70">
                      {formatDate(adminResponse.createdAt)} - {new Date(adminResponse.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <p className="text-neutral-dark">{adminResponse.content}</p>
                </div>
              </div>
            </div>
            
            {latestCitizenResponse && (
              <div className="bg-accent/5 p-4 rounded-lg border border-accent/10 mt-3">
                <div className="flex items-start">
                  <div className="bg-accent text-primary p-2 rounded-full mr-3 shadow-sm">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-primary">Pelapor</p>
                      <p className="text-xs text-neutral-dark/70">
                        {formatDate(latestCitizenResponse.createdAt)} - {new Date(latestCitizenResponse.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <p className="text-neutral-dark">{latestCitizenResponse.content}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end mt-3">
              <a 
                href={`/lihat-pengaduan/${complaint.trackingId}`} 
                className="text-primary text-sm font-medium hover:underline flex items-center"
              >
                Lihat Detail <Eye className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
