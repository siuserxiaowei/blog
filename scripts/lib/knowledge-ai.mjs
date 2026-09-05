import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const KNOWLEDGE_TOPICS = ['日常生活', '学习方法', 'AI 与工具', '工作实践', '阅读与思考'];
export const KNOWLEDGE_TYPES = ['日常', '学习', '工具', '方法', '随想'];

export function validateClassification(value) {
  if (!value || !KNOWLEDGE_TOPICS.includes(value.topic) || !KNOWLEDGE_TYPES.includes(value.type)) throw new Error('AI 分类格式无效');
  if (typeof value.description !== 'string' || !value.description.trim() || !Array.isArray(value.tags)) throw new Error('AI 摘要格式无效');
  return { topic: value.topic, type: value.type, description: value.description.trim().slice(0, 180),
    tags: [...new Set(value.tags.filter(x => typeof x === 'string').map(x => x.trim().slice(0, 24)).filter(Boolean))].slice(0, 5) };
}

export function createClassifier({ pythonBin = '/opt/homebrew/bin/python3', model = 'gpt-5.4-mini', onResult = () => {} } = {}) {
  return async ({ title, body }) => {
    const payload = { title: title.slice(0, 180), body: body.slice(0, 16000), model, topics: KNOWLEDGE_TOPICS, types: KNOWLEDGE_TYPES };
    try {
      const value = await new Promise((resolve, reject) => {
        const child = spawn(pythonBin, [fileURLToPath(new URL('./knowledge-ai-request.py', import.meta.url))], { stdio: ['pipe', 'pipe', 'ignore'] });
        let output = ''; let settled = false;
        const end = (error, result) => { if (settled) return; settled = true; clearTimeout(timer); error ? reject(error) : resolve(result); };
        const timer = setTimeout(() => { child.kill('SIGKILL'); end(new Error('AI 分类超时')); }, 75000);
        child.on('error', () => end(new Error('无法启动 AI 分类')));
        child.stdout.on('data', data => { output += data; if (output.length > 32768) { child.kill('SIGKILL'); end(new Error('AI 输出过长')); } });
        child.on('close', code => {
          if (code !== 0) return end(new Error('AI 分类暂不可用，使用本地分类'));
          try { end(null, validateClassification(JSON.parse(output))); } catch { end(new Error('AI 分类格式无效')); }
        });
        child.stdin.on('error', () => {});
        child.stdin.end(JSON.stringify(payload));
      });
      onResult('ai'); return value;
    } catch (error) { onResult('fallback'); throw error; }
  };
}
