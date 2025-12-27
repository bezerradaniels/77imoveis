import { useState } from "react";
import {
    Search,
    MoreVertical,
    Phone,
    Video,
    Paperclip,
    Send,
    Smile,
    Check,
    CheckCheck,
    ArrowLeft,
    MessageCircle
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { cn } from "../../../lib/utils";
import Seo from "../../../components/common/Seo";

type Message = {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    status: 'sent' | 'delivered' | 'read';
};

type Conversation = {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string; // Initials or URL
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    online?: boolean;
    propertyContext?: string; // "Interessado em: Casa Jardins"
};

const MOCK_CONVERSATIONS: Conversation[] = [
    {
        id: "1",
        userId: "u1",
        userName: "Roberto Almeida",
        userAvatar: "RA",
        lastMessage: "Combinado! Amanhã às 14h então.",
        lastMessageTime: "10:30",
        unreadCount: 2,
        online: true,
        propertyContext: "Apto. Jardins"
    },
    {
        id: "2",
        userId: "u2",
        userName: "Fernanda Costa",
        userAvatar: "FC",
        lastMessage: "O valor do condomínio está incluso?",
        lastMessageTime: "Ontem",
        unreadCount: 0,
        propertyContext: "Casa Alphaville"
    },
    {
        id: "3",
        userId: "u3",
        userName: "Imobiliária Silva",
        userAvatar: "IS",
        lastMessage: "Enviamos a proposta para o proprietário.",
        lastMessageTime: "Segunda",
        unreadCount: 0,
    }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
    "1": [
        { id: "m1", senderId: "me", text: "Olá Roberto, tudo bem? Vi que se interessou pelo apartamento.", timestamp: "10:15", status: "read" },
        { id: "m2", senderId: "u1", text: "Olá! Tudo sim. Gostaria de visitar.", timestamp: "10:20", status: "read" },
        { id: "m3", senderId: "me", text: "Claro! Podemos marcar para amanhã?", timestamp: "10:22", status: "read" },
        { id: "m4", senderId: "u1", text: "Pode ser. Qual horário fica bom pra você?", timestamp: "10:25", status: "read" },
        { id: "m5", senderId: "me", text: "Às 14h seria perfeito.", timestamp: "10:28", status: "read" },
        { id: "m6", senderId: "u1", text: "Combinado! Amanhã às 14h então.", timestamp: "10:30", status: "read" },
    ],
    "2": [
        { id: "m1", senderId: "u2", text: "Bom dia. O valor do condomínio está incluso?", timestamp: "Yesterday", status: "read" },
    ]
};

export default function Messages() {
    const [selectedId, setSelectedId] = useState<string | null>(MOCK_CONVERSATIONS[0].id);
    const [messageInput, setMessageInput] = useState("");

    // In a real app, this would be derived from backend data
    const activeConversation = MOCK_CONVERSATIONS.find(c => c.id === selectedId);
    const messages = selectedId ? (MOCK_MESSAGES[selectedId] || []) : [];

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;

        // Mock sending message logic (would update state/backend here)
        console.log("Sending:", messageInput);
        setMessageInput("");
    };

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <Seo title="77 Imóveis | Mensagens" />

            <div className="flex h-full">
                {/* Sidebar - Conversation List */}
                <div className={cn(
                    "w-full md:w-80 border-r border-gray-100 flex flex-col transition-all",
                    selectedId ? "hidden md:flex" : "flex"
                )}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Mensagens</h2>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                            <Input
                                placeholder="Buscar conversas..."
                                className="pl-9 bg-gray-50 border-gray-100 focus-visible:ring-lime-500"
                            />
                        </div>
                    </div>

                    {/* List */}
                    <div className="flex-1 overflow-y-auto">
                        {MOCK_CONVERSATIONS.map(conv => (
                            <div
                                key={conv.id}
                                onClick={() => setSelectedId(conv.id)}
                                className={cn(
                                    "flex items-start gap-3 p-4 cursor-pointer hover:bg-gray-50 transition-colors border-l-4 border-transparent",
                                    selectedId === conv.id && "bg-lime-50/30 border-lime-500"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-500 font-semibold border border-gray-200">
                                        {conv.userAvatar}
                                    </div>
                                    {conv.online && (
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <h3 className={cn("font-medium truncate", conv.unreadCount > 0 ? "text-gray-900 font-bold" : "text-gray-700")}>
                                            {conv.userName}
                                        </h3>
                                        <span className="text-xs text-gray-400 shrink-0">{conv.lastMessageTime}</span>
                                    </div>
                                    <p className={cn("text-sm truncate", conv.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-500")}>
                                        {conv.lastMessage}
                                    </p>
                                    {conv.propertyContext && (
                                        <p className="text-xs text-lime-600 mt-1 truncate">
                                            {conv.propertyContext}
                                        </p>
                                    )}
                                </div>

                                {conv.unreadCount > 0 && (
                                    <div className="w-5 h-5 rounded-full bg-lime-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-1">
                                        {conv.unreadCount}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Main Chat Area */}
                {activeConversation ? (
                    <div className={cn(
                        "flex-1 flex-col h-full bg-gray-50/50",
                        selectedId ? "flex" : "hidden md:flex"
                    )}>
                        {/* Chat Header */}
                        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="md:hidden -ml-2 text-gray-500"
                                    onClick={() => setSelectedId(null)}
                                >
                                    <ArrowLeft className="size-5" />
                                </Button>

                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                        {activeConversation.userAvatar}
                                    </div>
                                    {activeConversation.online && (
                                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900">{activeConversation.userName}</h3>
                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                        {activeConversation.online ? "Online agora" : "Visto por último hoje às 09:30"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                    <Phone className="size-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                    <Video className="size-5" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600">
                                    <MoreVertical className="size-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Messages Feed */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Date Divider Example */}
                            <div className="flex justify-center my-4">
                                <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                                    Hoje
                                </span>
                            </div>

                            {messages.map((msg) => {
                                const isMe = msg.senderId === 'me';
                                return (
                                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[75%] md:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm text-sm break-words relative group",
                                            isMe
                                                ? "bg-lime-500 text-white rounded-tr-none"
                                                : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                                        )}>
                                            {msg.text}
                                            <div className={cn(
                                                "text-[10px] mt-1 flex items-center justify-end gap-1 opacity-70",
                                                isMe ? "text-lime-100" : "text-gray-400"
                                            )}>
                                                <span>{msg.timestamp}</span>
                                                {isMe && (
                                                    msg.status === 'read'
                                                        ? <CheckCheck className="size-3" />
                                                        : <Check className="size-3" />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                                <div className="flex items-center gap-1 mb-2">
                                    <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-lime-600 hover:bg-lime-50">
                                        <Paperclip className="size-5" />
                                    </Button>
                                </div>

                                <div className="flex-1 relative">
                                    <Input
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Digite sua mensagem..."
                                        className="pr-10 py-3 rounded-xl border-gray-200 focus-visible:ring-lime-500 bg-gray-50/50"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Smile className="size-5 hover:text-gray-600 cursor-pointer" />
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    size="icon"
                                    className="bg-lime-500 hover:bg-lime-600 mb-[1px] rounded-xl shadow-sm"
                                    disabled={!messageInput.trim()}
                                >
                                    <Send className="size-5 ml-0.5" />
                                </Button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 hidden md:flex flex-col items-center justify-center bg-gray-50 text-gray-400">
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <MessageCircle className="size-8 text-gray-300" />
                        </div>
                        <p className="font-medium text-gray-900">Suas Mensagens</p>
                        <p className="text-sm mt-1">Selecione uma conversa para começar</p>
                    </div>
                )}
            </div>
        </div>
    );
}
