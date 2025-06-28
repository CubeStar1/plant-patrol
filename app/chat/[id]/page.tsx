import { createSupabaseServer } from "@/lib/supabase/server";
import { Chat } from "../components/chat";
import { notFound } from "next/navigation";
type Params = {
  id: string;
};

async function renameConversationWithFirstMessage(supabase: any, conversationId: string) {
  // Get the first user message
  const { data: firstUserMessage } = await supabase
    .from('messages')
    .select('content')
    .eq('conversation_id', conversationId)
    .eq('role', 'user')
    .order('created_at', { ascending: true })
    .single();

  if (firstUserMessage?.content) {
    const title = firstUserMessage.content.length > 50 
      ? firstUserMessage.content.substring(0, 47) + '...' 
      : firstUserMessage.content;
    
    await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);
  }
}

export default async function ChatPage({ params }: { params: Params }) {
  const { id } = params;
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch the conversation to verify it exists and user has access
  const { data: conversation } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();
  if (!conversation) {
    notFound();
  }

  // Verify user has access to this conversation
  if (conversation.user_id !== user?.id) {
    notFound();
  }

  // If the conversation is titled "New Chat" and has messages, rename it
  if (conversation.title === "New Chat") {
    await renameConversationWithFirstMessage(supabase, id);
  }

  // Fetch messages for this conversation
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", {
      ascending: true,
    });
  return (
    <Chat
      key={id}
      id={id}
      initialMessages={messages || []}
    />
  );
}
