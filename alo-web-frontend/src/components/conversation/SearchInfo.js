export const SearchInfo = ({search, setSearch, setIsSetting}) => {
   return (
    <>
    <p>Search</p>
    <button onClick={() => {setSearch(false); setIsSetting(true)}}>Close</button>
    </>
   )
}