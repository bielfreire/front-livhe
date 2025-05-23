// import { useState, useRef, ChangeEvent } from "react";
// import MainLayout from "@/components/MainLayout";
// import { useProfile } from "@/hooks/use-profile";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
//   CardFooter,
// } from "@/components/ui/card";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { UserRound, Mail, Package, Camera, Edit, Check, X, AtSign, Server, Network, KeyRound, Eye, EyeOff } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useToast } from "@/hooks/use-toast";
// import Breadcrumb from "@/components/Breadcrumb"; // Importando o componente Breadcrumb


// const Profile = () => {
//   const { profile, isLoading, updateProfile, isUpdating } = useProfile();
//   const [isEditing, setIsEditing] = useState(false);
//   const [editName, setEditName] = useState("");
//   const [editAccount, setEditAccount] = useState("");
//   const [editHost, setEditHost] = useState("");
//   const [editPort, setEditPort] = useState("");
//   const [editPasswordServer, setEditPasswordServer] = useState("");
//   const [showPasswordServer, setShowPasswordServer] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const { toast } = useToast();
  

//   if (isLoading || !profile) {
//     return (
//       <MainLayout>
//         <div className="flex items-center justify-center h-full">
//           <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFD110]"></div>
//         </div>
//       </MainLayout>
//     );
//   }

//   const handleEditProfile = () => {
//     setEditName(profile.name || "");
//     // Remove o @ do início do account se existir
//     setEditAccount(profile.account?.startsWith('@') ? profile.account.substring(1) : profile.account || "");
//     setEditHost(profile.host || "");
//     setEditPort(profile.port?.toString() || "");
//     setEditPasswordServer(profile.passwordServer || "");
//     setIsEditing(true);
//   };

//   const handleCancelEdit = () => {
//     setIsEditing(false);
//   };

//   const handleSaveEdit = async () => {
//     try {
//       // Garante que o account tenha o @ no início
//       const formattedAccount = editAccount.startsWith('@') ? editAccount : `@${editAccount}`;
      
//       await updateProfile({ 
//         name: editName,
//         account: formattedAccount,
//         host: editHost,
//         port: editPort ? parseInt(editPort, 10) : undefined,
//         passwordServer: editPasswordServer
//       });
//       setIsEditing(false);
//       toast({
//         title: "Perfil atualizado",
//         description: "Suas informações foram atualizadas com sucesso",
//       });
//     } catch (error) {
//       toast({
//         title: "Erro ao atualizar perfil",
//         description: "Não foi possível atualizar suas informações",
//         variant: "destructive",
//       });
//     }
//   };

//   const handleSelectImage = () => {
//     fileInputRef.current?.click();
//   };

//   const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     try {
//       await updateProfile({ photo: file });
//       toast({
//         title: "Foto atualizada",
//         description: "Sua foto de perfil foi atualizada com sucesso",
//       });
//     } catch (error) {
//       toast({
//         title: "Erro ao atualizar foto",
//         description: "Não foi possível atualizar sua foto de perfil",
//         variant: "destructive",
//       });
//     } finally {
//       // Reset input value to allow selecting the same file again
//       if (fileInputRef.current) {
//         fileInputRef.current.value = "";
//       }
//     }
//   };

//   const getFullImageUrl = (url?: string) => {
//     if (!url) return undefined;
//     if (url.startsWith('http')) return url;
//     return `https://livhe-production.up.railway.app${url}`;
//   };

//   return (
//     <MainLayout>
//        <Breadcrumb
//                 items={[
//                     { label: "Home", path: "/home" },
//                     { label: "Configurações", path: "/profile" },
//                 ]}
//             />
//       <div className="container mx-auto">
//         <Card className="max-w-3xl mx-auto bg-[#1E2028] border-[#2A2D36]">
//           <CardHeader className="pb-4">
//             <div className="flex flex-col items-center text-center">
//               <div className="relative">
//                 <Avatar className="h-24 w-24 mb-2">
//                   <AvatarImage 
//                     src={getFullImageUrl(profile.photo) || "/placeholder.svg"} 
//                     alt={profile.name || profile.account}
//                   />
//                   <AvatarFallback className="bg-[#2A2D36] text-3xl">
//                     {profile.name?.charAt(0).toUpperCase() || profile.account?.charAt(1).toUpperCase()}
//                   </AvatarFallback>
//                 </Avatar>
//                 <button 
//                   onClick={handleSelectImage}
//                   className="absolute bottom-2 right-0 bg-[#2A2D36] p-2 rounded-full hover:bg-[#3A3D46] transition-colors"
//                   disabled={isUpdating}
//                 >
//                   <Camera className="h-4 w-4 text-[#FFD110]" />
//                 </button>
//                 <input 
//                   type="file"
//                   ref={fileInputRef}
//                   onChange={handleImageUpload}
//                   className="hidden"
//                   accept="image/*"
//                 />
//               </div>
//               <div>
//                 {isEditing ? (
//                   <div className="flex flex-col items-center space-y-2">
//                     <div className="space-y-2 w-full max-w-xs">
//                       <div>
//                         <label htmlFor="name" className="text-sm text-gray-400 block mb-1">Nome Completo</label>
//                         <Input
//                           id="name"
//                           value={editName}
//                           onChange={(e) => setEditName(e.target.value)}
//                           className="bg-[#2A2D36] border-[#3A3D46] text-white"
//                         />
//                       </div>
//                       <div>
//                         <label htmlFor="account" className="text-sm text-gray-400 block mb-1">Nome de Usuário (@)</label>
//                         <div className="relative">
//                           <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
//                             <AtSign className="h-4 w-4" />
//                           </span>
//                           <Input
//                             id="account"
//                             value={editAccount}
//                             onChange={(e) => setEditAccount(e.target.value)}
//                             className="bg-[#2A2D36] border-[#3A3D46] text-white pl-10"
//                             placeholder="username"
//                           />
//                         </div>
//                       </div>
//                       <div>
//                         <label htmlFor="host" className="text-sm text-gray-400 block mb-1">Host</label>
//                         <Input
//                           id="host"
//                           value={editHost}
//                           onChange={(e) => setEditHost(e.target.value)}
//                           className="bg-[#2A2D36] border-[#3A3D46] text-white"
//                         />
//                       </div>
//                       <div>
//                         <label htmlFor="port" className="text-sm text-gray-400 block mb-1">Port</label>
//                         <Input
//                           id="port"
//                           value={editPort}
//                           onChange={(e) => setEditPort(e.target.value)}
//                           className="bg-[#2A2D36] border-[#3A3D46] text-white"
//                           type="number"
//                         />
//                       </div>
//                       <div>
//                         <label htmlFor="passwordServer" className="text-sm text-gray-400 block mb-1">Password Server</label>
//                         <div className="relative">
//                           <Input
//                             id="passwordServer"
//                             value={editPasswordServer}
//                             onChange={(e) => setEditPasswordServer(e.target.value)}
//                             className="bg-[#2A2D36] border-[#3A3D46] text-white"
//                             type={showPasswordServer ? "text" : "password"}
//                           />
//                           <button
//                             type="button"
//                             onClick={() => setShowPasswordServer(!showPasswordServer)}
//                             className="absolute inset-y-0 right-3 text-gray-400 hover:text-white"
//                           >
//                             {showPasswordServer ? <EyeOff size={20} /> : <Eye size={20} />}
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="flex space-x-2 mt-4">
//                       <Button 
//                         size="sm" 
//                         variant="outline" 
//                         className="flex items-center gap-1"
//                         onClick={handleSaveEdit}
//                         disabled={isUpdating}
//                       >
//                         <Check className="h-4 w-4" />
//                         Salvar
//                       </Button>
//                       <Button 
//                         size="sm" 
//                         variant="outline" 
//                         className="flex items-center gap-1"
//                         onClick={handleCancelEdit}
//                         disabled={isUpdating}
//                       >
//                         <X className="h-4 w-4" />
//                         Cancelar
//                       </Button>
//                     </div>
//                   </div>
//                 ) : (
//                   <>
//                     <CardTitle className="text-2xl text-white">
//                       {profile.account}
//                     </CardTitle>
//                     <CardDescription className="text-gray-400">
//                       {profile.role === "admin" ? "Administrador" : "Usuário"}
//                     </CardDescription>
//                   </>
//                 )}
//               </div>
//             </div>
//           </CardHeader>
//           <CardContent className="pt-6 space-y-6">
//             <div className="space-y-4">
//               <div className="flex items-center gap-3 text-gray-400">
//                 <UserRound className="h-5 w-5" />
//                 <span>Nome Completo:</span>
//                 <span className="text-white">{profile.name || "Não informado"}</span>
//               </div>
//               <div className="flex items-center gap-3 text-gray-400">
//                 <AtSign className="h-5 w-5" />
//                 <span>Nome de Usuário:</span>
//                 <span className="text-white">{profile.account}</span>
//               </div>
//               <div className="flex items-center gap-3 text-gray-400">
//                 <Mail className="h-5 w-5" />
//                 <span>Email:</span>
//                 <span className="text-white">{profile.email}</span>
//               </div>
//               <div className="flex items-center gap-3 text-gray-400">
//                 <Package className="h-5 w-5" />
//                 <span>Plano:</span>
//                 <span className="text-white capitalize">
//                   {profile.plan || "Free"}
//                 </span>
//               </div>
//             </div>
//           </CardContent>
//           <CardFooter className="pt-4 flex justify-center">
//             <Button 
//               onClick={handleEditProfile} 
//               className="bg-[#2A2D36] hover:bg-[#3A3D46] text-white"
//               disabled={isEditing || isUpdating}
//             >
//               <Edit className="h-4 w-4 mr-2" />
//               Editar Perfil
//             </Button>
//           </CardFooter>
//         </Card>

//         {/* Novo card para informações do servidor de Minecraft */}
//         <Card className="max-w-3xl mx-auto bg-[#1E2028] border-[#2A2D36] mt-6">
//           <CardHeader className="pb-4">
//             <h3 className="text-lg font-semibold text-white text-center">Informações do Servidor de Minecraft</h3>
//           </CardHeader>
//           <CardContent className="pt-6 space-y-4">
//             <div className="flex items-center gap-3 text-gray-400">
//               <Server className="h-5 w-5" />
//               <span>Host:</span>
//               <span className="text-white">{profile.host}</span>
//             </div>
//             <div className="flex items-center gap-3 text-gray-400">
//               <Network className="h-5 w-5" />
//               <span>Port:</span>
//               <span className="text-white">{profile.port}</span>
//             </div>
//             <div className="flex items-center gap-3 text-gray-400">
//               <KeyRound className="h-5 w-5" />
//               <span>Password server:</span>
//               <span className="text-white">
//                 {showPasswordServer ? profile.passwordServer : "••••••••"}
//               </span>
//               <button
//                 type="button"
//                 onClick={() => setShowPasswordServer(!showPasswordServer)}
//                 className="text-gray-400 hover:text-white"
//               >
//                 {showPasswordServer ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </MainLayout>
//   );
// };

// export default Profile;




import { useState, useRef, ChangeEvent } from "react";
import MainLayout from "@/components/MainLayout";
import { useProfile } from "@/hooks/use-profile";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserRound, Mail, Package, Camera, Edit, Check, X, AtSign, Server, Network, KeyRound, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Breadcrumb from "@/components/Breadcrumb"; // Importando o componente Breadcrumb


const Profile = () => {
  const { profile, isLoading, updateProfile, isUpdating } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAccount, setEditAccount] = useState("");
  const [editHost, setEditHost] = useState("");
  const [editPort, setEditPort] = useState("");
  const [editPasswordServer, setEditPasswordServer] = useState("");
  const [showPasswordServer, setShowPasswordServer] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  

  if (isLoading || !profile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#FFD110]"></div>
        </div>
      </MainLayout>
    );
  }

  const handleEditProfile = () => {
    setEditName(profile.name || "");
    // Remove o @ do início do account se existir
    setEditAccount(profile.account?.startsWith('@') ? profile.account.substring(1) : profile.account || "");
    setEditHost(profile.host || "");
    setEditPort(profile.port?.toString() || "");
    setEditPasswordServer(profile.passwordServer || "");
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSaveEdit = async () => {
    try {
      // Garante que o account tenha o @ no início
      const formattedAccount = editAccount.startsWith('@') ? editAccount : `@${editAccount}`;
      
      await updateProfile({ 
        name: editName,
        account: formattedAccount,
        host: editHost,
        port: editPort ? parseInt(editPort, 10) : undefined,
        passwordServer: editPasswordServer
      });
      setIsEditing(false);
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações",
        variant: "destructive",
      });
    }
  };

  const handleSelectImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await updateProfile({ photo: file });
      toast({
        title: "Foto atualizada",
        description: "Sua foto de perfil foi atualizada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar foto",
        description: "Não foi possível atualizar sua foto de perfil",
        variant: "destructive",
      });
    } finally {
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getFullImageUrl = (url?: string) => {
    if (!url) return undefined;
    if (url.startsWith('http')) return url;
    return `http://localhost:4000${url}`;
  };

  return (
    <MainLayout>
       <Breadcrumb
                items={[
                    { label: "Home", path: "/home" },
                    { label: "Configurações", path: "/profile" },
                ]}
            />
      <div className="container mx-auto">
        <Card className="max-w-3xl mx-auto bg-[#1E2028] border-[#2A2D36]">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center text-center">
              <div className="relative">
                <Avatar className="h-24 w-24 mb-2">
                  <AvatarImage 
                    src={getFullImageUrl(profile.photo) || "/placeholder.svg"} 
                    alt={profile.name || profile.account}
                  />
                  <AvatarFallback className="bg-[#2A2D36] text-3xl">
                    {profile.name?.charAt(0).toUpperCase() || profile.account?.charAt(1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <button 
                  onClick={handleSelectImage}
                  className="absolute bottom-2 right-0 bg-[#2A2D36] p-2 rounded-full hover:bg-[#3A3D46] transition-colors"
                  disabled={isUpdating}
                >
                  <Camera className="h-4 w-4 text-[#FFD110]" />
                </button>
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div>
                {isEditing ? (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="space-y-2 w-full max-w-xs">
                      <div>
                        <label htmlFor="name" className="text-sm text-gray-400 block mb-1">Nome Completo</label>
                        <Input
                          id="name"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="bg-[#2A2D36] border-[#3A3D46] text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="account" className="text-sm text-gray-400 block mb-1">Nome de Usuário (@)</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                            <AtSign className="h-4 w-4" />
                          </span>
                          <Input
                            id="account"
                            value={editAccount}
                            onChange={(e) => setEditAccount(e.target.value)}
                            className="bg-[#2A2D36] border-[#3A3D46] text-white pl-10"
                            placeholder="username"
                          />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="host" className="text-sm text-gray-400 block mb-1">Host</label>
                        <Input
                          id="host"
                          value={editHost}
                          onChange={(e) => setEditHost(e.target.value)}
                          className="bg-[#2A2D36] border-[#3A3D46] text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="port" className="text-sm text-gray-400 block mb-1">Port</label>
                        <Input
                          id="port"
                          value={editPort}
                          onChange={(e) => setEditPort(e.target.value)}
                          className="bg-[#2A2D36] border-[#3A3D46] text-white"
                          type="number"
                        />
                      </div>
                      <div>
                        <label htmlFor="passwordServer" className="text-sm text-gray-400 block mb-1">Password Server</label>
                        <div className="relative">
                          <Input
                            id="passwordServer"
                            value={editPasswordServer}
                            onChange={(e) => setEditPasswordServer(e.target.value)}
                            className="bg-[#2A2D36] border-[#3A3D46] text-white"
                            type={showPasswordServer ? "text" : "password"}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPasswordServer(!showPasswordServer)}
                            className="absolute inset-y-0 right-3 text-gray-400 hover:text-white"
                          >
                            {showPasswordServer ? <EyeOff size={20} /> : <Eye size={20} />}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2 mt-4">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={handleSaveEdit}
                        disabled={isUpdating}
                      >
                        <Check className="h-4 w-4" />
                        Salvar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex items-center gap-1"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      >
                        <X className="h-4 w-4" />
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <CardTitle className="text-2xl text-white">
                      {profile.account}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {profile.role === "admin" ? "Administrador" : "Usuário"}
                    </CardDescription>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-400">
                <UserRound className="h-5 w-5" />
                <span>Nome Completo:</span>
                <span className="text-white">{profile.name || "Não informado"}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <AtSign className="h-5 w-5" />
                <span>Nome de Usuário:</span>
                <span className="text-white">{profile.account}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Mail className="h-5 w-5" />
                <span>Email:</span>
                <span className="text-white">{profile.email}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400">
                <Package className="h-5 w-5" />
                <span>Plano:</span>
                <span className="text-white capitalize">
                  {profile.plan || "Free"}
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-4 flex justify-center">
            <Button 
              onClick={handleEditProfile} 
              className="bg-[#2A2D36] hover:bg-[#3A3D46] text-white"
              disabled={isEditing || isUpdating}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          </CardFooter>
        </Card>

        {/* Novo card para informações do servidor de Minecraft */}
        <Card className="max-w-3xl mx-auto bg-[#1E2028] border-[#2A2D36] mt-6">
          <CardHeader className="pb-4">
            <h3 className="text-lg font-semibold text-white text-center">Informações do Servidor de Minecraft</h3>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-400">
              <Server className="h-5 w-5" />
              <span>Host:</span>
              <span className="text-white">{profile.host}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <Network className="h-5 w-5" />
              <span>Port:</span>
              <span className="text-white">{profile.port}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400">
              <KeyRound className="h-5 w-5" />
              <span>Password server:</span>
              <span className="text-white">
                {showPasswordServer ? profile.passwordServer : "••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowPasswordServer(!showPasswordServer)}
                className="text-gray-400 hover:text-white"
              >
                {showPasswordServer ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Profile;
