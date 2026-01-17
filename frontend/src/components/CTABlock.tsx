import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export function CTABlock() {
  const commands = [
    "git clone https://github.com/jdcodes28/vocalize.git",
    "cd vocalize",
    "docker compose up --build",
  ];

  return (
    <Card className="bg-slate-900/60 border-white/10 backdrop-blur">
      <CardHeader>
        <CardTitle className="text-lg text-slate-50 flex items-center gap-2">
          <span className="text-blue-400">→</span>
          Try it locally
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="space-y-2">
          {commands.map((cmd, i) => (
            <code
              key={i}
              className="block bg-slate-800/80 px-3 py-2 rounded text-sm text-slate-200 font-mono overflow-x-auto"
            >
              {cmd}
            </code>
          ))}
        </div>
        <p className="text-xs text-slate-400 pt-2">
          Then open <code className="text-sky-400">http://localhost:4321</code>
        </p>
      </CardContent>
    </Card>
  );
}
