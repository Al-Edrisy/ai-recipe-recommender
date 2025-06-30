import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Search } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Recipe } from '@types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: Date;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSubmit: (message: string) => Promise<void>;
  loading: boolean;
  savedRecipes: Recipe[];
}

export const ChatPanel = ({ messages, onSubmit, loading, savedRecipes }: ChatPanelProps) => {
  const [input, setInput] = useState('');
  const [showRecipeSuggestions, setShowRecipeSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const filteredRecipes = savedRecipes.filter(recipe =>
    recipe.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    try {
      await onSubmit(input);
      setInput('');
      setShowRecipeSuggestions(false);
    } catch (error) {
      console.error('Failed to submit message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);
    
    if (value.startsWith('/')) {
      setShowRecipeSuggestions(true);
      setSearchQuery(value.substring(1).trim());
    } else {
      setShowRecipeSuggestions(false);
    }
  };

  const selectRecipe = (recipeId: string) => {
    setInput(`/load ${recipeId}`);
    setShowRecipeSuggestions(false);
    handleSubmit();
  };

  return (
    <div className="border rounded-lg h-full flex flex-col bg-background/50 backdrop-blur-sm">
      <ScrollArea className="flex-grow p-4">
        <div className="space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: msg.role === 'user' ? 50 : -50 }}
                transition={{ duration: 0.2 }}
              >
                {msg.role === 'assistant' && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ai-avatar.png" alt="AI" />
                    <AvatarFallback className="bg-primary text-white">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <motion.div
                  className={`max-w-[80%] p-4 rounded-xl ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {msg.content}
                </motion.div>

                {msg.role === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-secondary">
                      <UserIcon className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div
              className="flex gap-3 justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="/ai-avatar.png" alt="AI" />
                <AvatarFallback className="bg-primary text-white">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-muted p-4 rounded-xl max-w-[80%]">
                <div className="flex space-x-2">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </motion.div>
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
                  >
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-background/80 relative">
        {showRecipeSuggestions && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b flex items-center">
              <Search className="h-4 w-4 mr-2 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipes..."
                className="bg-transparent outline-none w-full text-sm"
                autoFocus
              />
            </div>
            <div className="divide-y">
              {filteredRecipes.length > 0 ? (
                filteredRecipes.map(recipe => (
                  <button
                    key={recipe.id}
                    className="w-full text-left p-2 hover:bg-accent"
                    onClick={() => selectRecipe(recipe.id)}
                  >
                    <div className="font-medium">{recipe.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {recipe.cuisine} • {recipe.prepTime} min
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No recipes found
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Type a message or / to search recipes..."
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="pr-20"
            />
            <motion.div
              className="absolute right-2 top-2"
              whileHover={{ scale: 1.05 }}
            >
              <Badge variant="secondary" className="text-xs">
                Enter to send
              </Badge>
            </motion.div>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={loading || !input.trim()}
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Try commands: <code>/load [recipe]</code>, <code>/save</code>,{' '}
          <code>/search [query]</code>
        </p>
      </div>
    </div>
  );
};