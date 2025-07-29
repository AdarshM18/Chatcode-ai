import React, { useContext, useState, useEffect } from 'react'
import { UserContext } from '../context/user.context'
import axios from "../config/axios"
import { useNavigate } from 'react-router-dom'

const Home = () => {

    const { user } = useContext(UserContext)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [projectName, setProjectName] = useState(null)
    const [project, setProject] = useState([])

    const navigate = useNavigate()

    function createProject(e) {
        e.preventDefault()
        axios.post('/projects/create', {
            name: projectName,
        })
            .then((res) => {
                setIsModalOpen(false)
                setProjectName("")
                // Re-fetch project list after creation
                return axios.get('/projects/all')
            })
            .then((res) => setProject(res.data.projects))
            .catch((error) => {
                console.error(error)
            })
    }

    useEffect(() => {
        axios.get('/projects/all')
            .then((res) => setProject(res.data.projects))
            .catch(err => console.log(err))
    }, [])

    return (
        <main className="min-h-screen p-6 bg-gradient-to-br from-gray-900 to-gray-800 text-white font-sans relative">
            {/* Cool code-themed background */}
            <div className="absolute inset-0 z-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>

            {/* Header */}
            <div className="relative z-10 mb-8">
                <h1 className="text-3xl font-bold mb-2">Welcome {user?.username || "Developer"} 👋</h1>
                <p className="text-gray-300">Manage your projects with ease.</p>
            </div>

            {/* Projects */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-slate-800 hover:bg-slate-700 border border-slate-600 p-6 rounded-lg transition-all duration-200 flex items-center justify-between"
                >
                    <span className="text-lg font-semibold">New Project</span>
                    <i className="ri-add-line text-2xl"></i>
                </button>

                {project.map((project) => (
                    <div
                        key={project._id}
                        onClick={() => {
                            navigate(`/project`, { state: { project } })
                        }}
                        className="bg-slate-700 hover:bg-slate-600 p-6 rounded-lg cursor-pointer transition-all duration-200 border border-slate-600"
                    >
                        <h2 className="text-xl font-bold mb-2">{project.name}</h2>
                        <p className="text-sm text-gray-300 flex items-center gap-2">
                            <i className="ri-user-line"></i>
                            {project.users.length} Collaborator{project.users.length !== 1 ? 's' : ''}
                        </p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-20">
                    <div className="bg-white text-black p-6 rounded-xl shadow-xl w-11/12 max-w-md">
                        <h2 className="text-xl font-bold mb-4">Create New Project</h2>
                        <form onSubmit={createProject}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                                <input
                                    onChange={(e) => setProjectName(e.target.value)}
                                    value={projectName}
                                    type="text"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}

export default Home
