import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// First, let's define the valid modes as a type
type DocumentationMode = 'single' | 'single-with-context' | 'combined-readme';

// Then define the shape of the request body
interface BaseRequestBody {
  files: string | string[];
  mode: DocumentationMode;
  model: string;
}

interface SingleWithContextRequest extends BaseRequestBody {
  mode: 'single-with-context';
  targetFile: string;
}

interface OtherModesRequest extends BaseRequestBody {
  mode: Exclude<DocumentationMode, 'single-with-context'>;
  targetFile?: string;
}

type RequestBody = SingleWithContextRequest | OtherModesRequest;

const DOCUMENTATION_PROMPTS: Record<DocumentationMode, string> = {
  'single': `
    Analyze the following code file and create comprehensive documentation that includes:
    
    1. File overview and purpose
    2. Key components/functions/classes
    3. Important dependencies and imports
    4. Usage examples where applicable
    5. Notable implementation details
    
    Format the documentation using markdown with clear sections.
  `,

  'single-with-context': `
    Create comprehensive documentation for ONLY the target file, while using the other files as context to better understand its role and relationships.
    DO NOT document the context files - they are provided only to help you understand how the target file fits into the larger system.
    
    Structure the documentation as follows:
    
    1. File Overview
       - Purpose and main responsibilities of THIS file
       - Key components/functions/classes defined in THIS file
    
    2. Context & Dependencies
       - How THIS file integrates with other files
       - Required dependencies and imports
       - What THIS file provides to other files
       - What THIS file uses from other files
    
    3. Implementation Details
       - Key algorithms and patterns in THIS file
       - Important state management
       - Notable technical decisions
    
    4. Usage Examples
       - How to use the components/functions from THIS file
       - Integration examples showing how THIS file works with others
    
    5. Related Files
       - Brief overview of how THIS file relates to others
       - Key dependencies and relationships
    
    Format using markdown with clear sections. Remember to focus ONLY on documenting the target file.
    
    Target File to Document: [Current file being documented]
    Context Files (for reference only): [List of other selected files]
  `,

  'combined-readme': `
    Create a comprehensive README.md for this collection of files that explains how they work together as a system.
    
    Structure the documentation as follows:
    
    # Project Component Documentation
    
    ## Overview
    - High-level explanation of this component/module
    - Purpose and main functionality
    - Key features
    
    ## Architecture
    - How the files work together
    - Key relationships and dependencies
    - Data flow between components
    
    ## Core Components
    For each major component:
    - Purpose and responsibilities
    - Key features
    - Dependencies and relationships
    - Usage examples
    
    ## Technical Details
    - Important implementation details
    - State management
    - Key patterns used
    
    ## File Structure
    - Explanation of each file's role
    - How files are organized
    - Key relationships between files
    
    ## Integration Guide
    - How to use these components
    - Common integration patterns
    - Important considerations
    
    Format using markdown with clear sections and subsections.
  `
};

export async function POST(request: Request) {
  try {
    const body: RequestBody = await request.json();
    const { files, targetFile, mode, model } = body;
    
    let systemPrompt = DOCUMENTATION_PROMPTS[mode];
    
    if (mode === 'single-with-context') {
      const filesList = typeof files === 'string' 
        ? files.split('=== FILE:').map(f => f.trim()).filter(Boolean)
        : files;

      systemPrompt = systemPrompt
        .replace('[Current file being documented]', targetFile)
        .replace('[List of other selected files]', filesList.join('\n'));
    }

    console.log(`API: Starting request for ${mode === 'combined-readme' ? 'README' : targetFile || 'single file'}`);

    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    console.log('API: Initiating OpenAI stream');
    const completion = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: mode === 'single-with-context'
            ? `Please generate documentation for this target file:\n\n=== TARGET FILE ===\n${targetFile}\n\n=== CONTEXT FILES ===\n${files}`
            : `Please generate documentation for the following files:\n\n${files}`
        }
      ],
      stream: true,
      stream_options: {
        include_usage: true
      }
    });

    (async () => {
      try {
        let fullContent = '';
        let chunkCount = 0;
        let finalUsage: OpenAI.CompletionUsage | null = null;
        console.log('API: Receiving chunks...');
        
        for await (const chunk of completion) {
          chunkCount++;
          
          if (chunk.choices[0]?.delta?.content) {
            const content = chunk.choices[0].delta.content;
            fullContent += content;
            const message = JSON.stringify({ type: 'content', content });
            await writer.write(encoder.encode(`data: ${message}\n\n`));
          }

          if ('usage' in chunk && chunk.usage) {
            finalUsage = chunk.usage;
            console.log('API: Generation complete! Summary:', {
              chunks: chunkCount,
              promptTokens: chunk.usage.prompt_tokens,
              completionTokens: chunk.usage.completion_tokens,
              totalTokens: chunk.usage.total_tokens,
              contentLength: fullContent.length
            });
          }
        }

        if (finalUsage) {
          const usageMessage = JSON.stringify({ 
            type: 'usage', 
            usage: {
              promptTokens: finalUsage.prompt_tokens,
              completionTokens: finalUsage.completion_tokens,
              totalTokens: finalUsage.total_tokens
            }
          });
          await writer.write(encoder.encode(`data: ${usageMessage}\n\n`));
        }

        await writer.write(encoder.encode('data: {"type": "done"}\n\n'));
      } catch (error) {
        console.error('API: Stream error:', error);
        const errorMessage = JSON.stringify({ type: 'error', error: 'Streaming error occurred' });
        await writer.write(encoder.encode(`data: ${errorMessage}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API: Initial error:', error);
    return NextResponse.json(
      { error: 'Failed to generate documentation' },
      { status: 500 }
    );
  }
} 