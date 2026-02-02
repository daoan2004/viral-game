import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className={cn(
          "relative bg-background w-full max-w-lg rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200",
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-muted-foreground">
          {children}
        </div>
        
        <div className="mt-6 flex justify-end">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  )
}
