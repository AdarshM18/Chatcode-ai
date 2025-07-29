// ---- START OF COMPONENT ----

import React, { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../context/user.context'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from '../config/axios'
import { initializeSocket, receiveMessage, sendMessage } from '../config/socket'
import Markdown from 'markdown-to-jsx'
import hljs from 'highlight.js';
import { getWebContainer } from '../config/webcontainer'


function SyntaxHighlightedCode(props) {
    const ref = useRef(null)

    React.useEffect(() => {
        if (ref.current && props.className?.includes('lang-') && window.hljs) {
            window.hljs.highlightElement(ref.current)
            ref.current.removeAttribute('data-highlighted')
        }
    }, [props.className, props.children])

    return <code {...props} ref={ref} />
}

const Project = () => {
    const location = useLocation()
    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedUserId, setSelectedUserId] = useState(new Set())
    const [project, setProject] = useState(location.state.project)
    const [message, setMessage] = useState('')
    const { user } = useContext(UserContext)
    const messageBox = useRef()

    const [users, setUsers] = useState([])
    const [messages, setMessages] = useState([])
    const [fileTree, setFileTree] = useState({})
    const [currentFile, setCurrentFile] = useState(null)
    const [openFiles, setOpenFiles] = useState([])
    const [webContainer, setWebContainer] = useState(null)
    const [iframeUrl, setIframeUrl] = useState(null)
    const [runProcess, setRunProcess] = useState(null)

    const handleUserClick = (id) => {
        setSelectedUserId(prev => {
            const newSet = new Set(prev)
            newSet.has(id) ? newSet.delete(id) : newSet.add(id)
            return newSet
        })
    }

    const addCollaborators = () => {
        axios.put("/projects/add-user", {
            projectId: location.state.project._id,
            users: Array.from(selectedUserId)
        }).then(res => {
            console.log(res.data)
            setIsModalOpen(false)
        }).catch(err => console.log(err))
    }

    const send = () => {
        sendMessage('project-message', { message, sender: user })
        setMessages(prev => [...prev, { sender: user, message }])
        setMessage("")
    }

    const WriteAiMessage = (message) => {
        const messageObject = JSON.parse(message)
        return (
            <div className="bg-slate-900 text-white rounded-md p-3 whitespace-pre-wrap">
                <Markdown
                    children={messageObject.text}
                    options={{ overrides: { code: SyntaxHighlightedCode } }}
                />
            </div>
        )
    }

    useEffect(() => {
        initializeSocket(project._id)

        if (!webContainer) {
            getWebContainer().then(container => {
                setWebContainer(container)
                console.log("container started")
            })
        }

        receiveMessage('project-message', data => {
            if (data.sender._id === 'ai') {
                const message = JSON.parse(data.message)
                if (message.fileTree) {
                    webContainer?.mount(message.fileTree)
                    setFileTree(message.fileTree || {})
                }
            }
            setMessages(prev => [...prev, data])
        })

        axios.get(`/projects/get-project/${location.state.project._id}`).then(res => {
            setProject(res.data.project)
            setFileTree(res.data.project.fileTree || {})
        })

        axios.get('/users/all').then(res => {
            setUsers(res.data.users)
        }).catch(console.log)
    }, [])

    function saveFileTree(ft) {
        axios.put('/projects/update-file-tree', {
            projectId: project._id,
            fileTree: ft
        }).then(console.log).catch(console.log)
    }

    return (
        <main className="h-screen w-screen flex font-sans">
            {/* Left Sidebar */}
            <section className="flex flex-col h-screen w-[26rem] bg-white border-r shadow-md relative">
                {/* Top bar */}
                <header className="flex justify-between items-center px-5 py-3 bg-gray-100 border-b sticky top-0 z-10">
                    <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                        <i className="ri-add-fill text-base"></i>
                        Add collaborator
                    </button>
                    <button onClick={() => setIsSidePanelOpen(!isSidePanelOpen)} className="text-xl">
                        <i className="ri-group-fill"></i>
                    </button>
                </header>

                {/* Messages */}
                <div className="flex flex-col flex-grow pt-14 pb-14 overflow-hidden relative">
                    <div ref={messageBox} className="flex-grow overflow-y-auto px-4 py-2 space-y-3 scrollbar-hide">
                        {messages.map((msg, index) => (
                            <div key={index} className={`rounded-lg p-3 ${msg.sender._id === 'ai' ? 'bg-slate-900 text-white max-w-[75%]' : 'bg-slate-100'} ${msg.sender._id === user._id.toString() ? 'ml-auto bg-blue-100' : ''}`}>
                                <small className="text-xs text-gray-600">{msg.sender.email}</small>
                                <div className="mt-1 text-sm">
                                    {msg.sender._id === 'ai'
                                        ? WriteAiMessage(msg.message)
                                        : <p>{msg.message}</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Input Field */}
                    <div className="absolute bottom-0 left-0 w-full flex p-3 bg-white border-t">
                        <input
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-1"
                            placeholder="Enter message"
                        />
                        <button onClick={send} className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            <i className="ri-send-plane-fill"></i>
                        </button>
                    </div>
                </div>

                {/* Side Panel */}
                <div className={`absolute top-0 left-0 w-full h-full bg-white transition-transform duration-300 shadow-md z-20 ${isSidePanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <header className="flex justify-between items-center px-5 py-3 bg-gray-200 border-b">
                        <h2 className="text-lg font-semibold">Collaborators</h2>
                        <button onClick={() => setIsSidePanelOpen(false)} className="text-xl">
                            <i className="ri-close-fill"></i>
                        </button>
                    </header>
                    <div className="overflow-y-auto p-3 space-y-2">
                        {project.users?.map(user => (
                            <div key={user._id} className="flex items-center gap-3 p-2 bg-gray-100 rounded-md shadow-sm">
                                <div className="w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center">
                                    <i className="ri-user-fill text-lg"></i>
                                </div>
                                <p className="font-medium text-sm">{user.email}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* Right Section */}
            <section className="flex-grow flex h-full">
                {/* File Explorer */}
                <div className="w-64 bg-gray-100 border-r overflow-y-auto">
                    <div className="p-2 space-y-1">
                        {Object.keys(fileTree).map((file, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setCurrentFile(file)
                                    setOpenFiles(prev => [...new Set([...prev, file])])
                                }}
                                className="w-full text-left px-4 py-2 rounded hover:bg-gray-200 bg-gray-300 text-sm font-medium"
                            >
                                {file}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Code Editor Area */}
                <div className="flex flex-col flex-grow h-full">
                    {/* File Tabs */}
                    <div className="flex justify-between items-center border-b bg-white px-4 py-2">
                        <div className="flex space-x-1">
                            {openFiles.map((file, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentFile(file)}
                                    className={`px-4 py-2 text-sm rounded-t ${currentFile === file ? 'bg-blue-100 font-semibold' : 'bg-gray-200 hover:bg-gray-300'}`}
                                >
                                    {file}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={async () => {
                                await webContainer.mount(fileTree)
                                const installProcess = await webContainer.spawn("npm", ["install"])
                                installProcess.output.pipeTo(new WritableStream({ write(chunk) { console.log(chunk) } }))

                                if (runProcess) runProcess.kill()
                                const tempRunProcess = await webContainer.spawn("npm", ["start"])
                                tempRunProcess.output.pipeTo(new WritableStream({ write(chunk) { console.log(chunk) } }))
                                setRunProcess(tempRunProcess)

                                webContainer.on('server-ready', (port, url) => {
                                    setIframeUrl(url)
                                })
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                        >
                            Run
                        </button>
                    </div>

                    {/* Code Area */}
                    <div className="flex-grow bg-white overflow-auto">
                        {fileTree[currentFile] && (
                            <pre className="hljs m-0">
                                <code
                                    className="hljs outline-none p-4"
                                    contentEditable
                                    suppressContentEditableWarning
                                    onBlur={(e) => {
                                        const updatedContent = e.target.innerText
                                        const updatedTree = {
                                            ...fileTree,
                                            [currentFile]: {
                                                file: { contents: updatedContent }
                                            }
                                        }
                                        setFileTree(updatedTree)
                                        saveFileTree(updatedTree)
                                    }}
                                    dangerouslySetInnerHTML={{
                                        __html: hljs.highlight('javascript', fileTree[currentFile].file.contents).value
                                    }}
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        counterSet: 'line-numbering',
                                        paddingBottom: '25rem'
                                    }}
                                />
                            </pre>
                        )}
                    </div>
                </div>

                {/* Iframe Preview */}
                {iframeUrl && webContainer && (
                    <div className="min-w-96 flex flex-col border-l">
                        <div className="bg-gray-200 px-4 py-2">
                            <input
                                type="text"
                                value={iframeUrl}
                                onChange={(e) => setIframeUrl(e.target.value)}
                                className="w-full px-2 py-1 border rounded text-sm"
                            />
                        </div>
                        <iframe src={iframeUrl} className="w-full h-full border-none" />
                    </div>
                )}
            </section>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-full">
                        <header className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-lg font-semibold">Select Collaborators</h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-600 hover:text-black">
                                <i className="ri-close-fill text-xl"></i>
                            </button>
                        </header>

                        <div className="space-y-2 max-h-80 overflow-y-auto">
                            {users.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => handleUserClick(user._id)}
                                    className={`flex items-center gap-3 p-2 rounded-md cursor-pointer ${selectedUserId.has(user._id) ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                >
                                    <div className="w-10 h-10 bg-slate-600 text-white rounded-full flex items-center justify-center">
                                        <i className="ri-user-fill text-lg"></i>
                                    </div>
                                    <p className="text-sm font-medium">{user.email}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={addCollaborators}
                            className="mt-5 w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                        >
                            Add Collaborators
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Project