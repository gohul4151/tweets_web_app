import {useState} from 'react';
import Addpostupdate from './post_update';
import '../modal.css';

function FileUpload({des,ti,tag,setclose,addpost}) {
    const [file, setfile] = useState(null);
    const [up, setup] = useState(false);
    const [r,setr]=useState();
    const maxSize = 50 * 1024 * 1024;
    return <>
        <div className='upload-button'>
            <input type="file" onChange={(e) => {
                setfile(e.target.files[0]);
                setup(true);
                setr("");
                const f=e.target.files[0];
                if (f.size>maxSize)
                {
                    setr("File size exceeds 50MB limit.upload the file below 50mb");
                    setup(false);
                    return ;
                }
            }}/>
            <div>{r}</div>
            {up && <Upload file={file} setup={setup} r={r} setr={setr} up={up}/>}
            <Addpostupdate des={des} ti={ti} tag={tag} file={file} setclose={setclose} addpost={addpost}/>
        </div>
    </>
}

function Upload({up,setr,r,setup}) {
    return <>     
        <button onClick={() => {setr("uploaded sucessfully"); setup(false);}} disabled={!up}>
            upload
        </button>
    </>
}

export default FileUpload