
"use client";
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AdminLoginModalProps {
  onClose: () => void;
  onLogin: (user: string, pass: string) => boolean;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ onClose, onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = onLogin(user, pass);
    if (!success) {
      setError('Usuario o contraseña incorrectos.');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Acceso de Administrador</DialogTitle>
          <DialogDescription>
            Ingresa tus credenciales para acceder al modo de edición.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Usuario
              </Label>
              <Input
                id="username"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="col-span-3"
                autoComplete="username"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="col-span-3"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="col-span-4 text-center text-sm text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Entrar</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
