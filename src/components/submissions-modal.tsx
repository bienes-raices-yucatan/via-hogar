
"use client";

import React from 'react';
import { ContactSubmission } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';

interface SubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: ContactSubmission[];
}

export const SubmissionsModal: React.FC<SubmissionsModalProps> = ({ isOpen, onClose, submissions }) => {
  
  const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
      });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Solicitudes de Contacto</DialogTitle>
          <DialogDescription>
            Aquí están los contactos recibidos para esta propiedad.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-96">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Tipo</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {submissions.length > 0 ? (
                    submissions
                    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
                    .map((sub) => (
                        <TableRow key={sub.id}>
                            <TableCell className="font-medium">{formatDate(sub.submittedAt)}</TableCell>
                            <TableCell>{sub.name}</TableCell>
                            <TableCell>{sub.phone}</TableCell>
                            <TableCell>
                                <Badge variant={sub.userType === 'broker' ? 'secondary' : 'default'}>
                                {sub.userType === 'buyer' ? 'Comprador' : 'Bróker'}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))
                ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center h-24">
                            No hay solicitudes de contacto todavía.
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
            </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
