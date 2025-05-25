import GenerateDefinition from "../components/gen-ai/GenerateDefinition"


export default function TestPage() {

  return <div className="min-h-screen">
    <GenerateDefinition word="apple"/>    
    {/* <LoadingIcon /> */}
  </div>
}