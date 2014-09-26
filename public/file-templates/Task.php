<?php
namespace Task;

use Mage\Task\AbstractTask;

class REPLACETHIS extends AbstractTask {
	public function getName() {
		return 'Running REPLACETHIS task';
	}

	public function run() {
	    $command = 'pwd';
	    //$result = $this->runCommandLocal($command); // TODO: Uncomment if you want to run a local command
	    $result = $this->runCommandRemote($command);

		return $result;
	}
}