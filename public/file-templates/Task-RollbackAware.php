<?php
namespace Task;

use Mage\Task\AbstractTask;
use Mage\Task\Releases\RollbackAware;

class REPLACETHIS extends AbstractTask implements RollbackAware {
	public function getName() {
		if ($this->inRollback()) {
		    return 'Running REPLACETHIS task [in rollback]';
		} else {
		    return 'Running REPLACETHIS task [not in rollback]';
		}
	}

	public function run() {
	    $command = 'pwd';
	    $result = $this->runCommandRemote($command);

		return $result;
	}
}
