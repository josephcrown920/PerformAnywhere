import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Landing from "@/pages/Landing";
import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/ProjectDetail";
import PublicRender from "@/pages/PublicRender";
import WorkflowStudio from "@/pages/WorkflowStudio";
import Orchestrate from "@/pages/Orchestrate";
import Account from "@/pages/Account";
const queryClient = new QueryClient();
function Router() { return <Switch><Route path="/" component={Landing} /><Route path="/projects" component={Projects} /><Route path="/projects/:id">{(params) => <ProjectDetail id={params.id} />}</Route><Route path="/r/:clientId/:projectId">{(params) => <PublicRender clientId={params.clientId} projectId={params.projectId} />}</Route><Route path="/studio" component={WorkflowStudio} /><Route path="/orchestrate" component={Orchestrate} /><Route path="/account" component={Account} /><Route><div className="flex min-h-screen items-center justify-center bg-background px-4"><div className="max-w-md text-center"><h1 className="font-display text-7xl text-foreground">404</h1><h2 className="mt-4 text-xl text-foreground">Scene not found</h2><p className="mt-2 text-sm text-muted-foreground">The page you're looking for has been cut from the final edit.</p></div></div></Route></Switch>; }
function App() { return <QueryClientProvider client={queryClient}><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}><Router /></WouterRouter><Toaster theme="dark" /></QueryClientProvider>; }
export default App;
