import { useChat } from "@ai-sdk/react";

import { Conversation, ConversationContent } from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import { TopicsSidebar } from "@/components/topics-sidebar";

export default function ChatPage({ params: { id } }) {
  const { messages, sendMessage, status } = useChat({ id });
  // `id` ties this session to your “topic”; persist titles in your DB.


  return (
    <div className="flex">
      <TopicsSidebar topics={/* fetch from DB */[]} />
      <main className="flex-1 p-4">
        <Conversation>
          <ConversationContent>
            {messages.map(m => (
              <Message key={m.id} from={m.role}>
                <MessageContent>{m.parts?.[0]?.text}</MessageContent>
              </Message>
            ))}
          </ConversationContent>
        </Conversation>
        {/* add PromptInput from AI Elements here */}
      </main>
    </div>
  );
}