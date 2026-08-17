export default async function Docs({params}){
    const {slug} = await params;
    if(slug?.length === 2){
        return (
        <div>Viewing docs for features {slug[0]} and concept {slug[1]}</div>
    )
    }else if(slug?.length === 1){
        return (
        <div>Viewing docs for features {slug[0]}</div>
    )
    }
    return(
        <div>Docs home pg</div>
    )
}