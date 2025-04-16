'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { UserMessage } from '../agents/base/base.types';

const cultures = [
  { value: 'american', label: 'American' },
  { value: 'chinese', label: 'Chinese' },
  { value: 'japanese', label: 'Japanese' },
  { value: 'indian', label: 'Indian' },
  { value: 'arab', label: 'Arab' },
  { value: 'european', label: 'European' },
  { value: 'latin', label: 'Latin American' },
  { value: 'african', label: 'African' },
];

const genders = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];


interface MessageInputProps {
    onSubmit: (message: UserMessage, model: string) => Promise<void>;
    isLoading?: boolean;
  }
  
  const models = [
    { value: 'openai', label: 'OpenAI GPT-4' },
    { value: 'meta', label: 'Meta Llama' },
  ];  
  
export default function MessageInput({ onSubmit, isLoading }: MessageInputProps) {
    const [selectedModel, setSelectedModel] = useState('openai');
  const [message, setMessage] = useState({
    text: '',
    sourceCulture: '',
    targetCulture: '',
    sourceGender: '',
    targetGender: '',
  });

  return (
    <Card className="w-full">
      <CardContent className="p-6 space-y-4">
      <div className="space-y-2">
  <label className="text-sm font-medium">Model</label>
  <Select
    value={selectedModel}
    onValueChange={(value) => setSelectedModel(value)}
  >
    <SelectTrigger>
      <SelectValue placeholder="Select model" />
    </SelectTrigger>
    <SelectContent>
      {models.map((model) => (
        <SelectItem key={model.value} value={model.value}>
          {model.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source Culture</label>
            <Select
              value={message.sourceCulture}
              onValueChange={(value) => 
                setMessage({ ...message, sourceCulture: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source culture" />
              </SelectTrigger>
              <SelectContent>
                {cultures.map((culture) => (
                  <SelectItem key={culture.value} value={culture.value}>
                    {culture.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Culture</label>
            <Select
              value={message.targetCulture}
              onValueChange={(value) => 
                setMessage({ ...message, targetCulture: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target culture" />
              </SelectTrigger>
              <SelectContent>
                {cultures.map((culture) => (
                  <SelectItem key={culture.value} value={culture.value}>
                    {culture.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Source Gender</label>
            <Select
              value={message.sourceGender}
              onValueChange={(value) => 
                setMessage({ ...message, sourceGender: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Gender</label>
            <Select
              value={message.targetGender}
              onValueChange={(value) => 
                setMessage({ ...message, targetGender: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target gender" />
              </SelectTrigger>
              <SelectContent>
                {genders.map((gender) => (
                  <SelectItem key={gender.value} value={gender.value}>
                    {gender.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Message</label>
          <Textarea
            value={message.text}
            onChange={(e) => setMessage({ ...message, text: e.target.value })}
            placeholder="Enter your message..."
            className="min-h-[100px]"
          />
        </div>

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => onSubmit(message, selectedModel)}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Analyze'}
        </Button>
      </CardContent>
    </Card>
  );
}