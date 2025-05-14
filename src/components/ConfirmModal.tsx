import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReactNode, useState } from "react";

interface ConfirmModalProps {
    title: string;
    description: string;
    onConfirm: () => void;
    trigger: ReactNode; // Qualquer elemento pode abrir o modal (botão, ícone, etc.)
}

export const ConfirmModal = ({ title, description, onConfirm, trigger }: ConfirmModalProps) => {
    const [open, setOpen] = useState(false);

    const handleConfirm = () => {
        onConfirm();
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent>
                <DialogHeader>{title}</DialogHeader>
                <p className="text-gray-600">{description}</p>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                    <Button variant="destructive" onClick={handleConfirm}>Confirmar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
