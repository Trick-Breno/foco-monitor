import {TaskList} from '@/components/features/TaskList'
import { RoutineController } from '@/components/features/RoutineController';

export default function HomePage(){
  return (
    <div>
      <RoutineController/>
      <TaskList/>
    </div>
  );
}