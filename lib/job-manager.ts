import { Job } from "./types";

class JobManager {
  private jobs: Map<number, Job> = new Map();
  private nextJobId = 1;
  private nextPid = 1000;

  createJob(command: string, background: boolean = false): Job {
    const job: Job = {
      id: this.nextJobId++,
      command,
      status: "running",
      pid: this.nextPid++,
      startTime: new Date(),
      background,
    };

    this.jobs.set(job.id, job);
    return job;
  }

  getJob(id: number): Job | undefined {
    return this.jobs.get(id);
  }

  getAllJobs(): Job[] {
    return Array.from(this.jobs.values());
  }

  updateJobStatus(id: number, status: Job["status"]): boolean {
    const job = this.jobs.get(id);
    if (job) {
      job.status = status;
      return true;
    }
    return false;
  }

  removeJob(id: number): boolean {
    return this.jobs.delete(id);
  }

  getJobByPid(pid: number): Job | undefined {
    const jobsArray = Array.from(this.jobs.values());
    for (const job of jobsArray) {
      if (job.pid === pid) {
        return job;
      }
    }
    return undefined;
  }

  killJob(id: number): boolean {
    const job = this.jobs.get(id);
    if (job && job.status === "running") {
      job.status = "terminated";
      return true;
    }
    return false;
  }

  killJobByPid(pid: number): boolean {
    const job = this.getJobByPid(pid);
    if (job) {
      return this.killJob(job.id);
    }
    return false;
  }

  getRunningJobs(): Job[] {
    return this.getAllJobs().filter((job) => job.status === "running");
  }

  getBackgroundJobs(): Job[] {
    return this.getAllJobs().filter(
      (job) => job.background && job.status === "running"
    );
  }
}

export const jobManager = new JobManager();
